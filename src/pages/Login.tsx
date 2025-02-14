import { useEffect, useState } from "react";
import { getFinancialYear, handleError } from "../assets/helperFunctions";
import Loading from "react-loading";
import { colorSecondary, url } from "../assets/constants";
import axios from "axios";
import { toast } from "react-toastify";
import { User, useUserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router";
import MyToast from "../components/MyToast";

axios.defaults.headers.common["Accept"] = "application/json";

type Props = {};
const initialValues = {
  email: "",
  password: "",
};

const Login: React.FC<Props> = ({}) => {
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserContext();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const resp = await axios.post(`${url}login`, data);
      const { data: response } = resp;
      let user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        token: response.token,
        rights: response.rights
      };
      setUser(user);
      navigate("/", { replace: true });
      toast.success(response.message, { containerId: "layout" });
    } catch (error) {
      handleError(error, "login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  return (
    <>
      <div className="login">
        <div className="login__card">
          <h1 className="login__app-name">Sales Pulse</h1>
          <h2 className="login__app-title">Monitor. Manage. Maximize.</h2>

          <form onSubmit={handleSubmit} method="POST" className="login__form">
            <div className="form-group">
              <input
                id="email"
                type="email"
                name="email"
                className="input"
                value={data.email}
                onChange={handleChange}
                placeholder="Email"                
                required
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="form-group">
              <input
                id="password"
                type="password"
                name="password"
                className="input"
                value={data.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <div className="form-group">
              <button className="btn" type="submit">
                Log in
              </button>
            </div>
          </form>
          {/* <div className="login__error">
            <p>Error Message</p>
          </div> */}
          <div className="loading">
            {loading && <Loading color={colorSecondary} type="bars" />}
          </div>
        </div>
        <div className="company-name">
          <p>&copy; ESSA GARMENTS PRIVATE LIMITED {getFinancialYear()}</p>
        </div>
        <MyToast position="top-right" containerId="login" />
      </div>
    </>
  );
};

export default Login;
