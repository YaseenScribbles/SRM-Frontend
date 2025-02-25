import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useUserContext } from "../../contexts/UserContext";
import { handleError, sendEmail } from "../../assets/helperFunctions";
import axios, { AxiosResponse } from "axios";
import ReactModal from "react-modal";
import Select from "../../components/Select";
import { colorGreyLight1, colorSecondary, url } from "../../assets/constants";
import AsyncCustomSelect from "../../components/AsyncSelect";
import { Popover } from "react-tiny-popover";
import SizePopOver from "../../components/SizePopOver";
import { toast } from "react-toastify";
import Loading from "react-loading";

type Props = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  editId: number;
  setEditId: Dispatch<SetStateAction<number>>;
  onSave: () => void;
};

type Option = {
  label: string;
  value: string;
};

const initialValue = {
  contact_id: 0,
  remarks: "",
  user_id: 1,
};

type SizeDetail = {
  size_id: number;
  size: string;
  qty: number;
};

type OrderItem = {
  size_id: number;
  brand: string;
  style: string;
  size: string;
  qty: number;
};

interface AppState {
  order_items: OrderItem[];
}

type AppActions =
  | { type: "AddItem"; payload: OrderItem }
  | { type: "RemoveItem"; payload: { size_id: number } }
  | { type: "UpdateQty"; payload: { size_id: number; qty: number } }
  | { type: "Clear" };

const appReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    case "AddItem":
      return { order_items: [...state.order_items, action.payload] };
    case "RemoveItem":
      return {
        order_items: state.order_items.filter(
          (i) => i.size_id !== action.payload.size_id
        ),
      };
    case "UpdateQty":
      return {
        order_items: state.order_items.map((item) => {
          if (item.size_id === action.payload.size_id) {
            return {
              ...item,
              qty: action.payload.qty,
            };
          }
          return item;
        }),
      };
    case "Clear":
      return {
        order_items: [],
      };
    default:
      return state;
  }
};

const AddEditOrder: React.FC<Props> = ({
  show,
  setShow,
  editId,
  setEditId,
  onSave,
}) => {
  const { user } = useUserContext();
  const [data, setData] = useState({
    ...initialValue,
    user_id: user?.id,
  });
  const [loading, setLoading] = useState(false);
  const [contactOptions, setContactOptions] = useState<Option[]>([]);
  const [selectedContact, setSelectedContact] = useState<Option | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);

  const [styleOptions, setStyleOptions] = useState<Option[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Option | null>(null);

  const [sizes, setSizes] = useState<SizeDetail[]>([]);

  const [showPopOver, setShowPopOver] = useState(false);

  const [state, dispatch] = useReducer(appReducer, { order_items: [] });
  const [triggerScroll, setTriggerScroll] = useState(false);
  const lastRowRef = useRef<HTMLTableRowElement>(null);

  const getContacts = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}contacts`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { contacts } = resp.data;
      const contactOptions: Option[] = contacts.map(
        (c: { id: number; name: string }) => ({
          label: c.name,
          value: c.id,
        })
      );
      setContactOptions(contactOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getBrands = async (query: string) => {
    if (query.length < 3) return [];
    try {
      setLoading(true);
      const encodedQuery = encodeURIComponent(query);
      const resp = await axios.get(`${url}brands?brand=${encodedQuery}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { brands } = resp.data;
      const brandOptions: Option[] = brands.map(
        (b: { id: number; name: string }) => ({
          label: b.name,
          value: b.id,
        })
      );
      return brandOptions;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getStyles = async (query: string) => {
    try {
      setLoading(true);
      // URL-encode the query to handle special characters
      const encodedQuery = encodeURIComponent(query);
      const resp = await axios.get(`${url}styles?brand=${encodedQuery}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { styles } = resp.data;
      const styleOptions: Option[] = styles.flatMap((s: { style: string }) => ({
        label: s.style,
        value: s.style,
      }));
      setStyleOptions(styleOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getSizes = async (brand: string, style: string) => {
    try {
      setLoading(true);
      const encodedBrand = encodeURIComponent(brand);
      const encodedStyle = encodeURIComponent(style);
      const resp = await axios.get(
        `${url}sizes?brand=${encodedBrand}&style=${encodedStyle}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const { sizes } = resp.data;
      const sizeOptions: SizeDetail[] = sizes.flatMap(
        (s: { size: string; size_id: string }) => ({
          size_id: +s.size_id,
          size: s.size,
          qty: 0,
        })
      );

      setSizes(sizeOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setData({ ...initialValue, user_id: user?.id });
    setSelectedContact(null);
    setSelectedBrand(null);
    setSelectedStyle(null);
    setSizes([]);
    setEditId(0);
    setShowPopOver(false);
    dispatch({
      type: "Clear",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!data.contact_id) {
      toast.warn("Please select contact", { containerId: "layout" });
      return;
    }

    if (state.order_items.length === 0) {
      toast.warn("No data", { containerId: "layout" });
      return;
    }

    try {
      setLoading(true);
      let response: AxiosResponse;

      if (editId > 0) {
        response = await axios.post(
          `${url}orders/${editId}?_method=PUT`,
          {
            ...data,
            order_items: state.order_items.map((i) => ({
              size_id: i.size_id,
              qty: i.qty,
            })),
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${url}orders`,
          {
            ...data,
            order_items: state.order_items.map((i) => ({
              size_id: i.size_id,
              qty: i.qty,
            })),
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
      }

      const {
        data: { message, id },
      } = response;

      sendEmail(id, user?.token!);
      toast.success(message, { containerId: "layout" });
      resetForm();
      onSave();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (id: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}orders/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const {
        data: { orderMaster, orderDetails },
      } = response;
      let contact = contactOptions.find(
        (c) => c.value === orderMaster[0].contact_id
      );
      setSelectedContact(contact || null);
      setData((prev) => ({
        ...prev,
        remarks: orderMaster[0].remarks,
      }));

      dispatch({
        type: "Clear",
      });

      orderDetails.map(
        (detail: {
          size_id: number;
          brand: string;
          style: string;
          size: string;
          qty: number;
        }) => {
          dispatch({
            type: "AddItem",
            payload: {
              size_id: +detail.size_id,
              brand: detail.brand,
              style: detail.style,
              size: detail.size,
              qty: +detail.qty,
            },
          });
        }
      );
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setData((prev) => ({ ...prev, contact_id: +selectedContact.value }));
    }
    if (selectedBrand) {
      getStyles(selectedBrand.label);
    }

    if (selectedBrand && selectedStyle) {
      getSizes(selectedBrand.label, selectedStyle.value);
    }
  }, [selectedContact, selectedBrand, selectedStyle]);

  useEffect(() => {
    if (editId > 0) {
      getOrder(editId);
    }
  }, [editId]);

  useEffect(() => {
    if (sizes.length > 0) {
      const sizeOptions: SizeDetail[] = sizes.map((s) => ({
        size_id: s.size_id,
        size: s.size,
        qty: state.order_items.find((i) => i.size_id === s.size_id)?.qty ?? 0,
      }));
      // Avoid unnecessary state updates by checking if the new value differs from the existing state
      setSizes((prevSizes) =>
        JSON.stringify(prevSizes) === JSON.stringify(sizeOptions)
          ? prevSizes
          : sizeOptions
      );
    }
  }, [JSON.stringify(sizes), JSON.stringify(state.order_items)]);

  useEffect(() => {
    if (triggerScroll && lastRowRef.current) {
      lastRowRef.current?.scrollIntoView({
        behavior: "smooth",
      });
      setTriggerScroll(false);
    }
  }, [triggerScroll]);

  return (
    <ReactModal
      isOpen={show}
      className="modal modal--big"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
      parentSelector={() => document.getElementById("work-space")!}
    >
      <div className="modal__header">
        <h2>{`${editId > 0 ? "Update Order" : "Add Order"}`}</h2>
        {loading && (
          <Loading type="balls" color={colorGreyLight1} height={"100%"} />
        )}
        <svg
          onClick={() => {
            setShow(false);
            resetForm();
          }}
        >
          <use xlinkHref="/icons/sprite.svg#icon-cross"></use>
        </svg>
      </div>
      <div className="modal__body">
        <form action="#" method="POST" className="form" onSubmit={handleSubmit}>
          <div className="modal__inputs">
            <div className="form__group">
              <Select
                id="contact_id"
                placeholder="Contact"
                options={contactOptions}
                value={selectedContact}
                handleChange={(e) => setSelectedContact(e)}
              />
            </div>
            <div className="form__group">
              <input
                type="text"
                className="input"
                value={data.remarks}
                name="remarks"
                id="remarks"
                placeholder="Remarks"
                onChange={(e) =>
                  setData((prev) => ({ ...prev, remarks: e.target.value }))
                }
              />
              <label htmlFor="remarks">Remarks</label>
            </div>
          </div>
          <div className="modal__inputs">
            <div className="form__group">
              <AsyncCustomSelect
                id="brand_id"
                placeholder="Brand"
                loadOptions={getBrands}
                value={selectedBrand}
                handleChange={(e) => {
                  setSelectedBrand(e);
                  setSelectedStyle(null);
                  setSizes([]);
                }}
              />
            </div>
            <div className="form__group">
              <Select
                id="style_id"
                placeholder="Style"
                options={styleOptions}
                value={selectedStyle}
                handleChange={(e) => setSelectedStyle(e)}
              />
            </div>
            <div className="form__group">
              <Popover
                reposition
                boundaryInset={10}
                isOpen={showPopOver}
                content={
                  <>
                    <SizePopOver
                      sizes={sizes}
                      setShow={setShowPopOver}
                      onDone={(e) => {
                        e.forEach((item) => {
                          let orderItemWithSameQty = state.order_items.find(
                            (i) =>
                              i.size_id === item.size_id && i.qty === item.qty
                          );
                          if (orderItemWithSameQty) {
                            return;
                          }

                          let orderItemWithZeroQty = state.order_items.find(
                            (i) => i.size_id === item.size_id && item.qty === 0
                          );

                          if (orderItemWithZeroQty) {
                            dispatch({
                              type: "RemoveItem",
                              payload: {
                                size_id: item.size_id,
                              },
                            });
                            return;
                          }

                          let orderItemWithMismatchingQty =
                            state.order_items.find(
                              (i) => i.size_id === item.size_id
                            );
                          if (orderItemWithMismatchingQty) {
                            dispatch({
                              type: "UpdateQty",
                              payload: {
                                size_id: item.size_id,
                                qty: item.qty,
                              },
                            });
                            return;
                          }

                          if (item.qty > 0) {
                            dispatch({
                              type: "AddItem",
                              payload: {
                                size_id: item.size_id,
                                brand: selectedBrand!.label,
                                style: selectedStyle!.label,
                                size: item.size,
                                qty: item.qty,
                              },
                            });
                            setTriggerScroll(true);
                          }
                        });
                      }}
                    />
                  </>
                }
                positions={["bottom", "left", "top"]}
                padding={20}
              >
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    if (!showPopOver) {
                      if (!selectedBrand || !selectedStyle) {
                        toast.warn("Please select brand and style", {
                          containerId: "layout",
                        });
                        return;
                      }
                    }
                    setShowPopOver(!showPopOver);
                  }}
                >
                  Add Sizes
                </button>
              </Popover>
            </div>
          </div>
          {
            <div className="modal_inputs mt-sm">
              <div className="form__group">
                <div className="grid__table-container fixed-height">
                  <table className="grid__table fixed-height">
                    <thead className="visible">
                      <tr>
                        <th className="hide">Size Id</th>
                        <th>Brand</th>
                        <th>Style</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.order_items.length > 0 ? (
                        state.order_items.map((item, i) => (
                          <tr
                            key={item.size_id}
                            ref={
                              i + 1 === state.order_items.length
                                ? lastRowRef
                                : null
                            }
                          >
                            <td className="hide">{item.size_id}</td>
                            <td>{item.brand}</td>
                            <td>{item.style}</td>
                            <td>{item.size}</td>
                            <td className="qty">
                              <input
                                type="text"
                                className="input input--sm"
                                value={item.qty || ""}
                                inputMode="numeric"
                                onChange={(e) => {
                                  if (isNaN(+e.target.value)) {
                                    toast.warn("Please enter valid numbers", {
                                      containerId: "layout",
                                    });
                                    return;
                                  }
                                  dispatch({
                                    type: "UpdateQty",
                                    payload: {
                                      size_id: item.size_id,
                                      qty: +e.target.value,
                                    },
                                  });
                                }}
                              />
                            </td>
                            <td className="actions">
                              <div className="icons">
                                <svg
                                  className="remove-icon"
                                  onClick={() =>
                                    dispatch({
                                      type: "RemoveItem",
                                      payload: { size_id: item.size_id },
                                    })
                                  }
                                >
                                  <use xlinkHref="/icons/sprite.svg#icon-circle-with-cross"></use>
                                </svg>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td style={{ textAlign: "center" }} colSpan={5}>
                            No Data
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {state.order_items.length > 0 && (
                      <tfoot className="visible">
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td className="center">
                            {state.order_items.reduce(
                              (acc, curr) => acc + curr.qty,
                              0
                            )}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          }
          <div className="modal__actions mt-sm">
            {loading ? (
              <div className="loading">
                <Loading color={colorSecondary} type="bars" />
              </div>
            ) : (
              <button type="submit" className="btn">
                {`${editId > 0 ? "Update" : "Save"}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </ReactModal>
  );
};

export default AddEditOrder;
