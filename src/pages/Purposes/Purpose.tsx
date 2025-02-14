import React, { useEffect, useState } from "react";
import Grid from "../../components/Grid";
import PageHeading from "../../components/PageHeading";
import {
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useUserContext } from "../../contexts/UserContext";
import AddEditPurpose from "./AddEditPurpose";
import TableButtons from "../../components/TableButtons";
import axios from "axios";
import { menus, url } from "../../assets/constants";
import { handleError } from "../../assets/helperFunctions";
import { toast } from "react-toastify";

type Props = {};

const Purpose: React.FC<Props> = ({}) => {
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
    columnHelper.accessor("active", {
      header: "Active",
      cell: (info) => (info.getValue() == "1" ? "Yes" : "No"),
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
              user?.rights.find((r) => r.menu === menus.Purpose)?.update === "1"
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

  const getPurposes = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}purposes`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setData(resp.data.purposes);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPurposes();
  }, []);

  return (
    <>
      <PageHeading
        title="Purpose"
        firstButtonText="Add Purpose"
        firstButtonIcon="plus"
        firstButtonFunction={() => {
          if (
            user?.rights.find((r) => r.menu === menus.Purpose)?.create === "1"
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
          reportName="Purpose"
          excludeSortingColumns={["actions"]}
        />
      )}
      <AddEditPurpose
        show={showModal}
        setShow={setShowModal}
        editId={editId}
        setEditId={setEditId}
        onSave={getPurposes}
      />
    </>
  );
};

export default Purpose;
