import React, { useEffect, useState } from "react";
import LatoRegular from "../../assets/Lato/Lato-Regular.ttf";
import LatoBold from "../../assets/Lato/Lato-Bold.ttf";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  BlobProvider,
} from "@react-pdf/renderer";
import axios from "axios";
import { colorSecondary, url } from "../../assets/constants";
import { useUserContext } from "../../contexts/UserContext";
import { handleError } from "../../assets/helperFunctions";
import { useParams } from "react-router";
import Loading from "react-loading";

type Props = {
  orderId: string;
  token: string;
};

type Order = {
  orderNo: string;
  date: string;
  contact: string;
  address: string;
  phone: string;
  remarks: string;
  createdBy: string;
};

type OrderItem = {
  s_no: string;
  name: string;
  style: string;
  size: string;
  qty: number;
};

Font.register({
  family: "Lato",
  fonts: [
    {
      src: LatoRegular,
    },
    {
      src: LatoBold,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    display: "flex",
    padding: "10px",
    fontFamily: "Lato",
    fontSize: "12px",
  },
  companyName: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  companyAddress: {
    marginTop: "10px",
  },
  title: {
    backgroundColor: "#f1f1f1",
    border: "1px solid #333",
    marginTop: "10px",
    padding: "5px",
  },
  masterContainer: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid #333",
  },
  partyDetailContainer: {
    flexBasis: "60%",
    padding: "5px",
    borderRight: "1px solid #333",
  },
  orderDetailContainer: {
    flexBasis: "40%",
    padding: "5px",
  },
  orderDetail: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderDetailHeading: {
    flexBasis: "35%",
  },
  orderDetailColon: {
    flexBasis: "5%",
  },
  orderDetailValue: {
    flexBasis: "60%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "100%",
  },
  tr: {
    flexDirection: "row",
  },
  td: {
    flex: 1,
    padding: 4,
  },
  th: {
    flex: 1,
    padding: 4,
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
  },
  center: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  mt_sm: {
    marginTop: "5px",
  },
});

const OrderPDF: React.FC<Props> = ({ orderId, token }) => {
  const [order, setOrder] = useState<Order>({
    orderNo: "",
    date: "",
    contact: "",
    address: "",
    phone: "",
    remarks: "",
    createdBy: "",
  });
  const [orderDetails, setOrderDetails] = useState<OrderItem[]>([]);
  // const { user } = useUserContext();
  // const { id } = useParams();
  const rowsPerPage = 22;
  const chunkArray = (array: OrderItem[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const paginatedOrderDetails = chunkArray(orderDetails, rowsPerPage);

  const getOrder = async () => {
    try {
      const resp = await axios.get(`${url}order-pdf/${orderId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { master, details } = resp.data;

      setOrder({
        orderNo: master[0].id,
        date: master[0].date,
        contact: master[0].contact,
        address: master[0].address,
        phone: master[0].phone,
        remarks: master[0].remarks,
        createdBy: master[0].user,
      });

      setOrderDetails(details);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  return (
    <Document>
      {paginatedOrderDetails.map((details, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          {/* Page Header */}
          <View style={[styles.companyName, styles.center]}>
            <Text>ESSA GARMENTS PRIVATE LIMITED</Text>
          </View>
          <View style={[styles.companyAddress, styles.center]}>
            <Text>
              42, VENKATESAIYA COLONY, KANGEYAM ROAD, TIRUPUR - 641604
            </Text>
          </View>
          <View style={[styles.companyAddress, styles.center]}>
            <Text>GSTIN : 33AADCE6591N1Z7</Text>
          </View>
          <View style={[styles.title, styles.center]}>
            <Text>ORDER FORM</Text>
          </View>

          {/* Master Details (Only on the First Page) */}
          {pageIndex === 0 && (
            <View style={[styles.masterContainer, styles.mt_sm]}>
              <View style={styles.partyDetailContainer}>
                <Text>FROM :</Text>
                <Text style={[styles.mt_sm, { fontWeight: "bold" }]}>
                  {order.contact.toUpperCase()}
                </Text>
                <Text style={styles.mt_sm}>{order.address}</Text>
                <Text style={[styles.mt_sm]}>Phone :</Text>
                <Text style={[styles.mt_sm, { fontWeight: "bold" }]}>
                  {order.phone}
                </Text>
              </View>
              <View style={styles.orderDetailContainer}>
                <View style={styles.orderDetail}>
                  <Text style={styles.orderDetailHeading}>Order No</Text>
                  <Text style={styles.orderDetailColon}>:</Text>
                  <View style={styles.orderDetailValue}>
                    <Text>{order.orderNo}</Text>
                  </View>
                </View>
                <View style={[styles.orderDetail, styles.mt_sm]}>
                  <Text style={styles.orderDetailHeading}>Date</Text>
                  <Text style={styles.orderDetailColon}>:</Text>
                  <View style={styles.orderDetailValue}>
                    <Text>{order.date}</Text>
                  </View>
                </View>
                <View style={[styles.orderDetail, styles.mt_sm]}>
                  <Text style={styles.orderDetailHeading}>Prepared By</Text>
                  <Text style={styles.orderDetailColon}>:</Text>
                  <View style={styles.orderDetailValue}>
                    <Text>{order.createdBy}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Order Details Table */}
          <View style={[styles.center, styles.mt_sm, { fontWeight: "bold" }]}>
            <Text>Order Details</Text>
          </View>
          <View style={[styles.table, styles.mt_sm]}>
            {/* Table Header */}
            <View style={styles.tr}>
              <View style={[styles.th, { flexBasis: "10%" }]}>
                <Text>S No</Text>
              </View>
              <View style={[styles.th, { flexBasis: "60%" }]}>
                <Text>Brand</Text>
              </View>
              <View style={[styles.th, { flexBasis: "10%" }]}>
                <Text>Style</Text>
              </View>
              <View style={[styles.th, { flexBasis: "10%" }]}>
                <Text>Size</Text>
              </View>
              <View style={[styles.th, { flexBasis: "10%" }]}>
                <Text>Quantity</Text>
              </View>
            </View>

            {/* Table Rows */}
            {details.map((detail, rowIndex) => (
              <View
                style={[styles.tr, { borderBottom: "0.5px solid #f1f1f1" }]}
                key={rowIndex}
              >
                <View style={[styles.td, { flexBasis: "10%" }]}>
                  <Text>{detail.s_no}</Text>
                </View>
                <View style={[styles.td, { flexBasis: "60%" }]}>
                  <Text>{detail.name}</Text>
                </View>
                <View style={[styles.td, { flexBasis: "10%" }]}>
                  <Text>{detail.style}</Text>
                </View>
                <View style={[styles.td, { flexBasis: "10%" }]}>
                  <Text>{detail.size}</Text>
                </View>
                <View
                  style={[styles.td, { flexBasis: "10%", textAlign: "right" }]}
                >
                  <Text>{detail.qty}</Text>
                </View>
              </View>
            ))}

            {/* Page Footer (Totals on the Last Page) */}
            {pageIndex === paginatedOrderDetails.length - 1 && (
              <View style={styles.tr}>
                <View style={[styles.th, { flexBasis: "10%" }]}></View>
                <View style={[styles.th, { flexBasis: "60%" }]}></View>
                <View style={[styles.th, { flexBasis: "10%" }]}></View>
                <View style={[styles.th, { flexBasis: "10%" }]}></View>
                <View
                  style={[styles.th, { flexBasis: "10%", textAlign: "right" }]}
                >
                  <Text>
                    {orderDetails
                      .reduce((acc, curr) => acc + +curr.qty, 0)
                      .toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Remarks on the Last Page */}
          {pageIndex === paginatedOrderDetails.length - 1 && (
            <>
              <View style={styles.mt_sm}>
                <Text>Remarks :</Text>
              </View>
              <View style={[styles.mt_sm, { fontWeight: "bold" }]}>
                <Text>{order.remarks}</Text>
              </View>
            </>
          )}

          {/* Page Number */}
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 10,
              color: "#888",
            }}
          >
            <Text>
              Page {pageIndex + 1} of {paginatedOrderDetails.length}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const PDFViewer: React.FC = () => {
  const { user } = useUserContext();
  const { id } = useParams();
  return (
    <BlobProvider document={<OrderPDF token={user!.token} orderId={id!} />}>
      {({ blob, error, loading, url }) => {
        if (loading)
          return (
            <div
              style={{
                width: "100%",
                height: "100dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loading type="bars" color={colorSecondary} />
            </div>
          );

        if (error || !url) {
          // Handle fallback: provide a download link if the blob fails
          if (blob) {
            const fallbackUrl = URL.createObjectURL(blob);
            return (
              <a className="btn" href={fallbackUrl} download="document.pdf">
                Download PDF
              </a>
            );
          }
          return <p>Failed to load PDF. No valid fallback available.</p>;
        }

        return <iframe src={url} width={"100%"} height={"100%"} />;
      }}
    </BlobProvider>
  );
};

export default PDFViewer;
