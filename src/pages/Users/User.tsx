import React, { lazy, Suspense, useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Grid from "../../components/Grid";
import { handleError } from "../../assets/helperFunctions";
import axios from "axios";
import { colorSecondary, menus, url } from "../../assets/constants";
import { useUserContext } from "../../contexts/UserContext";
// import AddEditUser from "./AddEditUser";
const AddEditUser = lazy(() => import("./AddEditUser"));
import TableButtons from "../../components/TableButtons";
import Loading from "react-loading";
import UserRights from "./UserRights";
import { toast } from "react-toastify";

type Props = {};

const User: React.FC<Props> = ({}) => {
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState(0);
  const [showRights, setShowRights] = useState(false);
  const [userRightId, setUserRightId] = useState(0);

  const columns = [
    columnHelper.accessor("id", {
      header: "Id",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("agent", {
      header: "Agent",
      cell: (info) => info.getValue() ?? "Not Specified",
    }),
    columnHelper.accessor("manager", {
      header: "Manager",
      cell: (info) => info.getValue() ?? "Not Specified",
    }),
    columnHelper.accessor("state", {
      header: "State",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("active", {
      header: "Active",
      cell: (info) => (info.getValue() == 1 ? "Yes" : "No"),
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        return (
          <TableButtons
            edit={
              user?.rights.find((r) => r.menu === menus.User)?.update === "1"
            }
            editFunction={() => {
              setEditId(info.row.original.id);
              setShowAddModal(true);
            }}
            rights={user?.role !== "user"}
            rightsFunction={() => {
              setUserRightId(info.row.original.id);
              setShowRights(true);
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

  const getUsers = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}users`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setData(resp.data.users);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <PageHeading
        title="Users"
        firstButtonText="Add User"
        firstButtonIcon="plus"
        firstButtonFunction={() => {
          if (
            user?.rights.find((r) => r.menu === menus.User)?.create === "1"
          )
            setShowAddModal(true)
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
          reportName="Users"
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
        <AddEditUser
          show={showAddModal}
          setShow={setShowAddModal}
          editId={editId}
          setEditId={setEditId}
          onSave={getUsers}
        />
      </Suspense>
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
        <UserRights
          show={showRights}
          setShow={setShowRights}
          editId={userRightId}
          setEditId={setUserRightId}
        />
      </Suspense>
    </>
  );
};

export default User;
