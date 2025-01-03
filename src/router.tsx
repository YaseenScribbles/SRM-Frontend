import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import User from "./pages/Users/User";
import Purpose from "./pages/Purposes/Purpose";
import Contact from "./pages/Contacts/Contact";
import Visit from "./pages/Visits/Visit";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/user",
        element: <User />,
      },
      {
        path:"/purpose",
        element: <Purpose />
      },
      {
        path:"/contact",
        element: <Contact />
      },
      {
        path:"/visit",
        element: <Visit />
      }
    ],
  },
]);

export default router;
