import React, { lazy, Suspense, useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import Loading from "react-loading";
import { colorSecondary, menus, url } from "../../assets/constants";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import { handleError, sendEmail } from "../../assets/helperFunctions";
import TableButtons from "../../components/TableButtons";
import Grid from "../../components/Grid";
import OrderPDF from "./OrderPDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
const AddEditModal = lazy(() => import("./AddEditOrder"));

type Props = {};

const Order: React.FC<Props> = ({}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState([]);
  const columnHelper = createColumnHelper<any>();
  const { user } = useUserContext();

  const columns: ColumnDef<any>[] = [
    {
      id: "s_no",
      header: "S. No",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex; // Current page index
        const pageSize = table.getState().pagination.pageSize; // Items per page        
        return pageIndex * pageSize + (row.index % pageSize) + 1; // Serial number calculation
      },
    },
    columnHelper.accessor("id", {
      header: "Order No.",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("contact", {
      header: "Contact",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("remarks", {
      header: "Remarks",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("user", {
      header: "Created By",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        return (
          <TableButtons
            edit={
              user?.rights.find((r) => r.menu === menus.Order)?.update === "1"
            }
            editFunction={() => {
              setEditId(info.row.original.id);
              setShowModal(true);
            }}
            pdf={
              user?.rights.find((r) => r.menu === menus.Order)?.print === "1"
            }
            downloadPDF={async () => {
              try {
                setLoading(true);
                const resp = await axios.get(
                  `${url}order-pdf/${info.row.original.id}`,
                  {
                    headers: {
                      Accept: "application/json",
                      Authorization: `Bearer ${user?.token}`,
                    },
                  }
                );

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

                // Create a download link
                const pdfurl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = pdfurl;
                a.download = `Order_${info.row.original.id}.pdf`; // Set the file name
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(pdfurl);
              } catch (error) {
                handleError(error);
              } finally {
                setLoading(false);
              }
            }}
            email={
              user?.rights.find((r) => r.menu === menus.Order)?.print === "1"
            }
            sendEmail={async () => {
              try {
                setLoading(true);
                toast.info("Generating PDF and sending email...", {
                  containerId: "layout",
                });
                sendEmail(info.row.original.id, user?.token!);
              } catch (error: any) {
                toast.warn(error.message, { containerId: "layout" });
              } finally {
                setLoading(false);
              }
            }}
          />
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  });

  const getOrders = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}orders`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { orders } = resp.data;
      setData(orders);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <>
      <PageHeading
        title="Orders"
        firstButtonText="Add Order"
        firstButtonFunction={() => {
          if (user?.rights.find((r) => r.menu === menus.Order)?.create === "1")
            setShowModal(true);
          else {
            toast.warn("Please contact admin", { containerId: "layout" });
          }
        }}
        firstButtonIcon="plus"
        loading={loading}
      />
      {data.length > 0 && (
        <Grid
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          table={table}
          tableData={data}
          reportName="Orders"
          excludeSortingColumns={["actions"]}
        />
      )}
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              willChange: "transform"
            }}
          >
            <Loading color={colorSecondary} type="bars" />
          </div>
        }
      >
        <AddEditModal
          show={showModal}
          setShow={setShowModal}
          editId={editId}
          setEditId={setEditId}
          onSave={getOrders}
        />
      </Suspense>
    </>
  );
};

export default Order;
