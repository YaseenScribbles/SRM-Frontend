import axios from "axios";
import { toast } from "react-toastify";
import OrderPDF from "../pages/Orders/OrderPDF";
import { pdf } from "@react-pdf/renderer";
import { url } from "./constants";

export const getFinancialYear = (): string => {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  if (month >= 4) {
    return `${year} - ${(year + 1).toString().slice(2)}`;
  } else {
    return `${year - 1} - ${year.toString().slice(2)}`;
  }
};

export const handleError = (error: any, containerId = "layout") => {
  if (axios.isAxiosError(error)) {
    var err = error.response;
    if (Array.isArray(err?.data.errors)) {
      for (let val of err?.data.errors) {
        toast.warning(val.description, { containerId: containerId });
      }
    } else if (typeof err?.data.errors === "object") {
      for (let e in err?.data.errors) {
        toast.warning(err.data.errors[e][0], { containerId: containerId });
      }
    } else if (err?.status == 401) {
      toast.warning("Please login", { containerId: containerId });
      localStorage.removeItem("sales_pulse_user");
      location.assign("/login");
    } else if (err?.data.message) {
      toast.warning(err.data.message, { containerId: containerId });
    } else if (err) {
      toast.warning(err?.data, { containerId: containerId });
    }
  }
};

export const sendEmail = async (id: string, token: string) => {
  try {
    const resp = await axios.get(`${url}order-pdf/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const { master, details } = resp.data;

    const order = {
      orderNo: master[0].id,
      date: master[0].date,
      contact: master[0].contact,
      address: master[0].address,
      phone: master[0].phone,
      remarks: master[0].remarks,
      createdBy: master[0].user,
    };

    const doc = <OrderPDF order={order} orderDetails={details} />;
    // Create an instance of the PDF and wait for it to render
    const pdfInstance = pdf(doc);
    const blob = await pdfInstance.toBlob();

    const response = await axios.post(
      `${url}email-pdf`,
      {
        id,
        pdf: blob,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      }
    );

    const { message } = response.data;
    toast.success(message, { containerId: "layout" });
  } catch (error) {
    handleError(error);
  }
};
