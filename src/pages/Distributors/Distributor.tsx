import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useUserContext } from "../../contexts/UserContext";
import TableButtons from "../../components/TableButtons";
import axios from "axios";
import { colorSecondary, menus, url } from "../../assets/constants";
import { handleError } from "../../assets/helperFunctions";
import PageHeading from "../../components/PageHeading";
import Grid from "../../components/Grid";
import Loading from "react-loading";
import { toast } from "react-toastify";
const AddEditDistributor = lazy(() => import("./AddEditDistributor"));

type Props = {};

const Distributor: React.FC<Props> = ({}) => {
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

  const columns = [
    columnHelper.accessor("id", {
      header: "Id",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("address", {
      header: "Address",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("city", {
      header: "City",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("district", {
      header: "District",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("state", {
      header: "State",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("pincode", {
      header: "Pincode",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        return (
          <TableButtons
            edit={
              user?.rights.find((r) => r.menu === menus.Distributor)?.update ===
              "1"
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

  const getDistributors = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}distributors`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setData(resp.data.distributors);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDistributors();
  }, []);

  return (
    <>
      <PageHeading
        title="Distributor"
        firstButtonText="Add Distributor"
        firstButtonIcon="plus"
        firstButtonFunction={() => {
          if (
            user?.rights.find((r) => r.menu === menus.Distributor)?.create === "1"
          )
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
          reportName="Distributors"
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
              willChange:"transform"
            }}
          >
            <Loading color={colorSecondary} type="bars" />
          </div>
        }
      >
        <AddEditDistributor
          show={showModal}
          setShow={setShowModal}
          editId={editId}
          setEditId={setEditId}
          onSave={getDistributors}
        />
      </Suspense>
    </>
  );
};

export default Distributor;
