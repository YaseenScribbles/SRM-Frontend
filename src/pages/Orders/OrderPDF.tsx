import React from "react";
import LatoRegular from "../../assets/Lato/Lato-Regular.ttf";
import LatoBold from "../../assets/Lato/Lato-Bold.ttf";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { v4 as uuid } from "uuid"

type Props = {
  order: Order;
  orderDetails: OrderItem[];
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
    display: "flex",
    flexWrap: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    alignSelf: "center",        
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

const OrderPDF: React.FC<Props> = ({ order, orderDetails }) => {
  const rowsPerPage = 10;
  const chunkArray = (
    array: { brand: string; style: string }[],
    size: number
  ) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const uniqueSizes = Array.from(
    new Set(orderDetails.map((order: OrderItem) => order.size))
  ).sort((a: any, b: any) => a - b);

  const uniqueBrandsAndStyles = Array.from(
    new Map(
      orderDetails.map((item) => [
        `${item.name}-${item.style}`,
        { brand: item.name, style: item.style },
      ])
    ).values()
  );
 
  const paginatedOrderDetails = chunkArray(uniqueBrandsAndStyles, rowsPerPage);

  return (
    <Document>
      {paginatedOrderDetails.map((details, pageIndex) => (
        <Page
          size="A4"
          orientation="landscape"
          style={styles.page}
          key={uuid()}
        >
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
              <View style={[styles.th]}>
                <Text>S No</Text>
              </View>
              <View style={[styles.th, { flexBasis: "25%" }]}>
                <Text wrap={false}>Brand</Text>
              </View>
              <View style={[styles.th, { flexBasis: "5%" }]}>
                <Text>Style</Text>
              </View>
              {uniqueSizes.map((size: any) => (
                <View key={uuid()} style={[styles.th]}>
                  <Text>{size}</Text>
                </View>
              ))}
              <View style={[styles.th, { textAlign: "right" }]}>
                <Text>Total</Text>
              </View>
            </View>

            {/* Table Rows */}
            {details.map((detail, rowIndex) => (
              <View
                style={[styles.tr, { borderBottom: "0.5px solid #f1f1f1" }]}
                key={uuid()}
              >
                <View style={[styles.td, { textAlign: "center" }]}>
                  <Text>{pageIndex * rowsPerPage + rowIndex + 1}</Text>
                </View>
                <View style={[styles.td, { flexBasis: "25%" }]}>
                  <Text>{detail.brand}</Text>
                </View>
                <View style={[styles.td, { flexBasis: "5%" }]}>
                  <Text>{detail.style}</Text>
                </View>
                {uniqueSizes.map((size) => (
                  <View key={uuid()} style={[styles.td]}>
                    <Text>
                      {(() => {
                        const qty = Number(
                          orderDetails.find(
                            (order) =>
                              order.name === detail.brand &&
                              order.style === detail.style &&
                              order.size === size
                          )?.qty || 0
                        );
                        return qty > 0 ? qty.toFixed(0) : "";
                      })()}
                    </Text>
                  </View>
                ))}
                <View style={[styles.td, { textAlign: "right" }]}>
                  <Text>
                    {orderDetails
                      .filter(
                        (order) =>
                          order.name == detail.brand &&
                          order.style == detail.style
                      )
                      .reduce((acc, curr) => acc + +curr.qty, 0)
                      .toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Page Footer (Totals on the Last Page) */}
            {pageIndex === paginatedOrderDetails.length - 1 && (
              <View style={styles.tr}>
                <View style={[styles.th]}></View>
                <View style={[styles.th, { flexBasis: "25%" }]}></View>
                <View style={[styles.th, { flexBasis: "5%" }]}></View>
                {uniqueSizes.map(() => (
                  <View key={uuid()} style={[styles.th]}></View>
                ))}
                <View style={[styles.th, { textAlign: "right" }]}>
                  <Text>
                    {orderDetails
                      .reduce((acc, curr) => acc + +curr.qty, 0)
                      .toFixed(0)}
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

export default OrderPDF;
