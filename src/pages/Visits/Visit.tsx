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
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useUserContext } from "../../contexts/UserContext";
import TableButtons from "../../components/TableButtons";
import axios from "axios";
import { colorSecondary, menus, url } from "../../assets/constants";
import { handleError } from "../../assets/helperFunctions";
import PageHeading from "../../components/PageHeading";
import Grid from "../../components/Grid";
import Loading from "react-loading";
import { toast } from "react-toastify";
// import AddEditVisit from "./AddEditVisit";
const AddEditVisit = lazy(() => import("./AddEditVisit"));

type Props = {};

const Visit: React.FC<Props> = ({}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState([]);
  const columnHelper = createColumnHelper<any>();
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(0);

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
    columnHelper.accessor("id",{
      header: "Visit No.",
      cell:(info) => info.getValue()
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("contact", {
      header: "Contact",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("purpose", {
      header: "Purpose",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("response", {
      header: "Response",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("user", {
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        return (
          <TableButtons
            edit={
              user?.rights.find((r) => r.menu === menus.Visit)?.update === "1"
            }
            editFunction={() => {
              setEditId(info.row.original.id);
              setShowModal(true);
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

  const getVisits = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}visits`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setData(resp.data.visits);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVisits();
  }, []);

  return (
    <>
      <PageHeading
        title="Visit"
        firstButtonText="Add Visit"
        firstButtonIcon="plus"
        firstButtonFunction={() => {
          if (user?.rights.find((r) => r.menu === menus.Visit)?.create === "1")
            setShowModal(true);
          else {
            toast.warn("Please contact admin", { containerId: "layout" });
          }
        }}
        loading={loading}
      />
      {data.length > 0 && (
        <Grid
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          table={table}
          tableData={data}
          reportName="Visits"
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
        <AddEditVisit
          show={showModal}
          setShow={setShowModal}
          editId={editId}
          setEditId={setEditId}
          onSave={getVisits}
        />
      </Suspense>
    </>
  );
};

export default Visit;
