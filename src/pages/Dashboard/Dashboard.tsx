import React, { useEffect, useRef, useState } from "react";
import Loading from "react-loading";
import { colorPrimary, colorSecondary, url } from "../../assets/constants";
import Select from "../../components/Select";
import { handleError } from "../../assets/helperFunctions";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import { v4 as uuid } from "uuid";
import MyDateRangePicker from "../../components/MyDateRangePicker";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

type Props = {};

type Option = {
  label: string;
  value: string;
};

type Visit = {
  contact: string;
  purpose: string;
  user: string;
  time: string;
};

type Order = {
  contact: string;
  qty: string;
  user: string;
  time: string;
};

type Count = {
  user: string;
  visits: number;
  orders: number;
  quantity: string;
};

type OrderItem = {
  brand: string;
  style: string;
  quantity: string;
  user: string;
};

type State = {
  name: string;
  orders: string;
  qty: string;
};

type District = {
  district: string;
  orders: string;
  qty: string;
};

type Top10Product = {
  Product: string;
  Quantity: number;
};

type OrderGraph = {
  time: string;
  orderCount: number;
  totalQuantity: number;
};

const Dashboard: React.FC<Props> = ({}) => {
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const { user } = useUserContext();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState<Count[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showRange, setShowRange] = useState(false);
  const [duration, setDuraion] = useState({
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
  });
  const rangePickerBtnRef = useRef<HTMLButtonElement>(null);
  const [top10Product, setTop10Product] = useState<Top10Product[]>([]);
  const [orderGraphData, setOrderGraphData] = useState<OrderGraph[]>([]);

  const getUsers = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}user-role-users`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const { users } = resp.data;
      const userOptions = users.map((user: { id: number; name: string }) => ({
        label: user.name,
        value: user.id,
      }));
      setUserOptions(userOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to convert timestamps into hourly time slots
  const processData = (data: Order[]): OrderGraph[] => {
    const groupedData = new Map<
      string,
      { orderCount: number; totalQuantity: number; sortKey: number }
    >();

    data.forEach((order) => {
      // Parse the timestamp correctly
      const parsedDate = new Date(order.time);

      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        console.error("Invalid date:", order.time); // Log invalid dates
        return;
      }

      // Format the date to group by hourly slots (e.g., "2025-01-25 20:00")
      const hourSlot = format(parsedDate, "h a");
      const sortKey = parseInt(format(parsedDate, "H"), 10);

      // Initialize the hour slot if not present
      if (!groupedData.has(hourSlot)) {
        groupedData.set(hourSlot, {
          orderCount: 0,
          totalQuantity: 0,
          sortKey: sortKey,
        });
      }

      // Update order count and total quantity
      const currentData = groupedData.get(hourSlot)!;
      currentData.orderCount += 1;
      currentData.totalQuantity += +order.qty;
    });

    // Convert map to array and sort by time
    return Array.from(groupedData.entries())
      .map(([time, values]) => ({
        time,
        orderCount: values.orderCount,
        totalQuantity: values.totalQuantity,
        sortKey: values.sortKey,
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ sortKey, ...rest }) => rest);
  };

  const getData = async () => {
    try {
      setLoading(true);

      let response = await axios.get(
        `${url}dashboard?from_date=${duration.fromDate}&to_date=${
          duration.toDate
        }&user_id=${selectedUser ? `${selectedUser.value}` : ""}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const { visits, orders, count, orderItems, states, districts } =
        response.data;

      const productMap = new Map<string, Top10Product>();

      orderItems.forEach((o: { brand: string; quantity: number }) => {
        if (!productMap.has(o.brand)) {
          productMap.set(o.brand, { Product: o.brand, Quantity: 0 });
        }
        productMap.get(o.brand)!.Quantity += +o.quantity; // Safe usage with "!"
      });

      const top10Product: Top10Product[] = Array.from(productMap.values())
        .sort((a, b) => b.Quantity - a.Quantity) // Sort in descending order
        .slice(0, 10)
        .sort(() => Math.random() - 0.5);

      const orderGraphData = processData(orders);

      setOrderGraphData(orderGraphData);
      setVisits(visits);
      setOrders(orders);
      setCount(count);
      setOrderItems(orderItems);
      setStates(states);
      setDistricts(districts);
      setTop10Product(top10Product);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    getData();
  }, [selectedUser, duration]);

  return (
    <>
      <div className="heading">
        <div className="heading__title">
          <h2>Dashboard</h2>
        </div>
        <div className="loading">
          {loading && <Loading color={colorSecondary} type="bars" />}
        </div>
        <div className="form">
          <div className="form-group">
            <button
              className="btn"
              onClick={() => setShowRange(!showRange)}
              ref={rangePickerBtnRef}
            >
              Range
            </button>
            <MyDateRangePicker
              show={showRange}
              setDuration={setDuraion}
              setShow={setShowRange}
              buttonRef={rangePickerBtnRef}
            />
          </div>
          <div className="form-group">
            <Select
              options={userOptions}
              placeholder="Select User"
              value={selectedUser}
              handleChange={(e) => setSelectedUser(e)}
              id="user_id"
              isLabelReq={false}
            />
          </div>
        </div>
      </div>
      <div className="db-grid">
        {visits.length > 0 && (
          <div className="db-grid__cell db-grid__cell--1">
            <label className="title">VISITS</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Purpose</th>
                    <th>User</th>
                    <th>On</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={uuid()}>
                      <td>{visit.contact}</td>
                      <td>{visit.purpose}</td>
                      <td>{visit.user}</td>
                      <td>
                        {format(new Date(visit.time), "MMM d yyyy hh:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {orders.length > 0 && (
          <div className="db-grid__cell db-grid__cell--2">
            <label className="title">ORDERS</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Qty</th>
                    <th>User</th>
                    <th>On</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={uuid()}>
                      <td>{order.contact}</td>
                      <td className="end">{(+order.qty).toFixed(0)}</td>
                      <td>{order.user}</td>
                      <td>
                        {format(new Date(order.time), "MMM d yyyy hh:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {count.length > 0 && (
          <div className="db-grid__cell db-grid__cell--3">
            <label className="title">COUNT</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Visits</th>
                    <th>Orders</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {count.map((count) => (
                    <tr key={uuid()}>
                      <td>{count.user}</td>
                      <td className="end">{count.visits}</td>
                      <td className="end">{count.orders}</td>
                      <td className="end">{(+count.quantity).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {orderItems.length > 0 && (
          <div className="db-grid__cell db-grid__cell--4">
            <label className="title">ORDER DETAILS</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Style</th>
                    <th>Quantity</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems?.map((item) => (
                    <tr key={uuid()}>
                      <td>{item.brand}</td>
                      <td>{item.style}</td>
                      <td className="end">{(+item.quantity).toFixed(0)}</td>
                      <td>{item.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {states.length > 0 && (
          <div className="db-grid__cell db-grid__cell--5">
            <label className="title">STATEWISE REPORT</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Orders</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => (
                    <tr key={uuid()}>
                      <td>{state.name}</td>
                      <td className="end">{state.orders}</td>
                      <td className="end">{state.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {top10Product.length > 0 && (
          <div className="db-grid__cell db-grid__cell--6">
            <label className="title">Top 10 - Products</label>
            <div className="chart-container">
              <ResponsiveContainer
                height="100%"
                width="100%"
                style={
                  {
                    // backgroundColor: "#fff",
                  }
                }
              >
                <BarChart
                  data={top10Product}
                  margin={{
                    top: 10,
                    right: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid />
                  <XAxis
                    dataKey="Product"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis dataKey="Quantity" />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ paddingTop: "1rem" }}
                    iconType="star"
                  />
                  <Bar dataKey="Quantity" fill={`${colorPrimary}`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* {orderGraphData.length > 0 && (
          <div className="db-grid__cell db-grid__cell--7">
            <label className="title">Order Trends</label>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderGraphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orderCount"
                    stroke={`${colorPrimary}`}
                    name="Order Count"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalQuantity"
                    stroke={`${colorSecondary}`}
                    name="Total Quantity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )} */}
        {/* {orderGraphData.length > 0 && (
          <div className="db-grid__cell db-grid__cell-1">
            <label className="title">Order Trends</label>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderGraphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="orderCount"
                    fill={`${colorPrimary}`}
                    name="Order Count"
                  />
                  <Bar
                    dataKey="totalQuantity"
                    fill={`${colorSecondary}`}
                    name="Total Quantity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )} */}
        {orderGraphData.length > 0 && (
          <div className="db-grid__cell db-grid__cell--7">
            <label className="title">Hourly Order Summary</label>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={orderGraphData}
                  margin={{
                    top: 10,
                    right: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="orderCount"
                    stroke={`${colorSecondary}`}
                    fill={`${colorSecondary}`}
                    name="Order Count"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalQuantity"
                    stroke={`${colorPrimary}`}
                    fill={`${colorPrimary}`}
                    name="Total Quantity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* {orderGraphData.length > 0 && (
          <div className="db-grid__cell db-grid__cell-1">
            <label className="title">Order Trends</label>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderGraphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orderCount"
                    stroke={`${colorPrimary}`}
                    name="Order Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalQuantity"
                    stroke={`${colorSecondary}`}
                    name="Total Quantity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )} */}
        {districts.length > 0 && (
          <div className="db-grid__cell db-grid__cell--5">
            <label className="title">DISTRICT REPORT</label>
            <div className="table__container">
              <table className="table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Orders</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((district) => (
                    <tr key={uuid()}>
                      <td>{district.district}</td>
                      <td className="end">{district.orders}</td>
                      <td className="end">{district.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
