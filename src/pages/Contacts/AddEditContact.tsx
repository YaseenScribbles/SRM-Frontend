import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useUserContext } from "../../contexts/UserContext";
import { toast } from "react-toastify";
import axios, { AxiosResponse } from "axios";
import { colorSecondary, url } from "../../assets/constants";
import { handleError } from "../../assets/helperFunctions";
import ReactModal from "react-modal";
import Select from "../../components/Select";
import Checkbox from "../../components/Checkbox";
import Loading from "react-loading";
import MyToast from "../../components/MyToast";

type Option = {
  label: string;
  value: string;
};

type Props = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  editId: number;
  setEditId: Dispatch<SetStateAction<number>>;
  onSave: () => void;
};

const initialValue = {
  name: "",
  address: "",
  city: "",
  district: "",
  state_id: "",
  phone: "",
  pincode: "",
  active: true,
  user_id: 1,
};

const AddEditContact: React.FC<Props> = ({
  show,
  setShow,
  editId,
  setEditId,
  onSave,
}) => {
  const { user } = useUserContext();
  const [data, setData] = useState({ ...initialValue, user_id: user?.id });
  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [selectedState, setSelectedState] = useState<Option | null>(null);

  const resetForm = () => {
    setData(initialValue);
    setEditId(0);
    setSelectedState(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.name == "") {
      toast.warn("Please fill the name");
      return;
    }

    try {
      setLoading(true);
      let resp: AxiosResponse;

      if (editId > 0) {
        resp = await axios.post(`${url}contacts/${editId}?_method=PUT`, data, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } else {
        resp = await axios.post(`${url}contacts`, data, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
      }

      toast.success(resp.data.message);
      resetForm();
      onSave();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getContact = async (id: number) => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}contacts/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { data } = resp;

      if (data.state_id) {
        const selectedState = stateOptions.find(
          (s) => s.value == data.state_id
        );
        setSelectedState(selectedState ?? null);
      }
      setData({
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        state_id: data.state_id,
        phone: data.phone,
        pincode: data.pincode,
        active: data.active == "1" ? true : false,
        user_id: user?.id,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStates = async () => {
    try {
      const resp = await axios.get(`${url}states`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const states = resp.data.states.map(
        (m: { id: number; name: string }) => ({ label: m.name, value: m.id })
      );
      setStateOptions(states);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (editId) getContact(editId);
  }, [editId]);

  useEffect(() => {
    if (selectedState) {
      setData((p) => ({ ...p, state_id: selectedState.value }));
    }
  }, [selectedState]);

  useEffect(() => {
    getStates();
  }, []);

  return (
    <ReactModal
      isOpen={show}
      className="modal modal--purpose"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal__header">
        <h2>{`${editId > 0 ? "Update Contact" : "Add Contact"}`}</h2>
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
            <div className="form__group full">
              <input
                type="text"
                className="input"
                value={data.name}
                name="name"
                id="name"
                placeholder="Name"
                onChange={(e) => setData({ ...data, name: e.target.value?.toUpperCase() })}                               
              />
              <label htmlFor="name">Name</label>
            </div>
            <div className="form__group full">
              <input
                type="text"
                className="input"
                value={data.address}
                name="address"
                id="address"
                placeholder="Address"
                onChange={(e) => setData({ ...data, address: e.target.value?.toUpperCase() })}                
              />
              <label htmlFor="address">Address</label>
            </div>
            <div className="form__group">
              <input
                type="text"
                className="input"
                value={data.city}
                name="city"
                id="city"
                placeholder="City"
                onChange={(e) => setData({ ...data, city: e.target.value?.toUpperCase() })}                
              />
              <label htmlFor="city">City</label>
            </div>
            <div className="form__group">
              <input
                type="text"
                className="input"
                value={data.district}
                name="district"
                id="district"
                placeholder="District"
                onChange={(e) => setData({ ...data, district: e.target.value?.toUpperCase() })}                
              />
              <label htmlFor="district">District</label>
            </div>
            <div className="form__group">
              <Select
                id="state_id"
                placeholder="State"
                options={stateOptions}
                value={selectedState}
                handleChange={(e) => setSelectedState(e)}
              />
            </div>
            <div className="form__group">
              <input
                type="text"
                className="input"
                value={data.phone}
                name="phone"
                id="phone"
                placeholder="Phone"
                onChange={(e) => setData({ ...data, phone: e.target.value })}                
              />
              <label htmlFor="phone">Phone</label>
            </div>
            <div className="form__group">
              <input
                type="text"
                className="input"
                value={data.pincode}
                name="pincode"
                id="pincode"
                placeholder="Pincode"
                onChange={(e) => setData({ ...data, pincode: e.target.value })}                
              />
              <label htmlFor="pincode">Pincode</label>
            </div>
            {editId > 0 && (
              <div className="form__group">
                <Checkbox
                  name="active"
                  labelText="Active"
                  value={data.active}
                  handleChange={(e) =>
                    setData({ ...data, active: e.target.checked })
                  }
                />
              </div>
            )}
          </div>
          <div className="modal__actions">
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
        <MyToast position="bottom-left" />
      </div>
    </ReactModal>
  );
};

export default AddEditContact;
