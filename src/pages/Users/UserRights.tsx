import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { colorSecondary, url } from "../../assets/constants";
import Loading from "react-loading";
import { useUserContext } from "../../contexts/UserContext";
import { handleError } from "../../assets/helperFunctions";
import axios from "axios";
import Checkbox from "../../components/Checkbox";
import { toast } from "react-toastify";

type Props = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  editId: number;
  setEditId: Dispatch<SetStateAction<number>>;
};

// type Menu = {
//   id: number;
//   name: string;
// };

type UserRight = {
  menu_id: number;
  menu: string;
  create: boolean;
  view: boolean;
  update: boolean;
  delete: boolean;
  print: boolean;
};

const UserRights: React.FC<Props> = ({ show, setShow, editId, setEditId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUserContext();
  const [userRights, setUserRights] = useState<UserRight[]>([]);
  const [name, setName] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    menu: string,
    right: string
  ) => {
    const newUserRights: UserRight[] = userRights.map((r) => {
      if (r.menu == menu)
        return {
          ...r,
          [right]: e.target.checked,
        };
      return r;
    });
    setUserRights(newUserRights);
  };

  const handleClick = (right: string) => {
    const newUserRights: UserRight[] = userRights.map((r) => {
      switch (right) {
        case "create":
          return {
            ...r,
            create: true,
          };
        case "view":
          return {
            ...r,
            view: true,
          };
        case "update":
          return {
            ...r,
            update: true,
          };
        case "delete":
          return {
            ...r,
            delete: true,
          };
        case "print":
          return {
            ...r,
            print: true,
          };
        case "all":
          return {
            ...r,
            create: true,
            view: true,
            update: true,
            delete: true,
            print: true,
          };
        default:
          return r;
      }
    });
    setUserRights(newUserRights);
  };

  const getUserRights = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}user-rights/${editId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const { userRights, name } = resp.data;
      const newUserRights: UserRight[] = userRights.map(
        (right: Record<string, any>) => ({
          ...right,
          create: right.create == 1 ? true : false,
          view: right.view == 1 ? true : false,
          update: right.update == 1 ? true : false,
          delete: right.delete == 1 ? true : false,
          print: right.print == 1 ? true : false,
        })
      );
      setName(name);
      setUserRights(newUserRights);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const resp = await axios.post(
        `${url}user-rights/${editId}?_method=PUT`,
        { userRights },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const { message } = resp.data;
      toast.success(message, {
        containerId: "layout",
      });
      setUserRights([]);
      setName("");
      setEditId(0);
      setShow(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editId) getUserRights();
  }, [editId]);

  return (
    <ReactModal
      isOpen={show}
      className="modal rights"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
      parentSelector={() => document.getElementById("work-space")!}
    >
      <div className="modal__header">
        <h2>User Rights {name && `(${name})`}</h2>
        <svg
          onClick={() => {
            setUserRights([]);
            setName("");
            setEditId(0);
            setShow(false);
          }}
        >
          <use xlinkHref="/icons/sprite.svg#icon-cross"></use>
        </svg>
      </div>
      <div className="modal__body">
        <div className="modal__inputs">
          <div className="form__group full">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleClick("all")}>Menu</th>
                    <th onClick={() => handleClick("create")}>Create</th>
                    <th onClick={() => handleClick("view")}>View</th>
                    <th onClick={() => handleClick("update")}>Update</th>
                    <th onClick={() => handleClick("delete")}>Delete</th>
                    <th onClick={() => handleClick("print")}>Print</th>
                  </tr>
                </thead>
                <tbody>
                  {userRights.map((right, index) => (
                    <tr key={index}>
                      <td>{right.menu}</td>
                      <td>
                        <Checkbox
                          name={`${right.menu}_create`}
                          value={right.create}
                          handleChange={(e) =>
                            handleChange(e, right.menu, "create")
                          }
                        />
                      </td>
                      <td>
                        <Checkbox
                          name={`${right.menu}_view`}
                          value={right.view}
                          handleChange={(e) =>
                            handleChange(e, right.menu, "view")
                          }
                        />
                      </td>
                      <td>
                        <Checkbox
                          name={`${right.menu}_update`}
                          value={right.update}
                          handleChange={(e) =>
                            handleChange(e, right.menu, "update")
                          }
                        />
                      </td>
                      <td>
                        <Checkbox
                          name={`${right.menu}_delete`}
                          value={right.delete}
                          handleChange={(e) =>
                            handleChange(e, right.menu, "delete")
                          }
                        />
                      </td>
                      <td>
                        <Checkbox
                          name={`${right.menu}_print`}
                          value={right.print}
                          handleChange={(e) =>
                            handleChange(e, right.menu, "print")
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="modal_actions">
          {loading ? (
            <div className="loading">
              <Loading color={colorSecondary} type="bars" />
            </div>
          ) : (
            <button type="button" className="btn" onClick={handleUpdate}>
              Update
            </button>
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default UserRights;
