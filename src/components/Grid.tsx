import * as XLSX from "xlsx";
import { flexRender, Table } from "@tanstack/react-table"; // or wherever it's coming from
import { SetStateAction } from "react";


type Props = {
    globalFilter: string;
    setGlobalFilter: React.Dispatch<SetStateAction<string>>;
    table: Table<any>;
    tableData: any[];
    reportName: string;
    tooltipColumns? : string[];
    footerRequired?: boolean;
    excludeSortingColumns?: string[];

};

const Grid:React.FC<Props> = ({
    globalFilter,
    setGlobalFilter,
    table,
    tableData,
    reportName,
    tooltipColumns = [],
    footerRequired = false,
    excludeSortingColumns = [],
}) => {
    const handleExport = (data: any[], reportName: string) => {
        // Format headers
        const transformHeader = (key :string) => {
            return key
                .replace(/_/g, " ") // Replace underscores with spaces
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
        };

        const isDateField = (header : string) => header.toLowerCase().endsWith("date");

        const isStringField = (header :string) => header.toLowerCase().endsWith("code");

        // Process data: convert numbers, format dates
        const processedData = data.map((row) => {
            const newRow : Record<string, any> = {};
            Object.keys(row).forEach((key) => {
                let value = row[key];

                // Format date fields based on header
                if (
                    isDateField(key) &&
                    typeof value === "string" &&
                    !isNaN(Date.parse(value))
                ) {
                    const date = new Date(value);
                    value = date.toLocaleDateString();
                }

                // Convert numeric strings to numbers
                if (!isNaN(value) && value !== "" && !isStringField(key)) {
                    value = parseFloat(value);
                }

                newRow[transformHeader(key)] = value; // Apply header transformation
            });
            return newRow;
        });

        // Convert the data into a worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate an Excel file and trigger download
        XLSX.writeFile(workbook, reportName + ".xlsx");
    };

    return (
        <div className="grid">
            <input
                type="text"
                className="input grid__input"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search"
            />
            <div className="grid__table-container">
                <table className="grid__table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        <div
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {!excludeSortingColumns.includes(
                                                header.column.id
                                            ) && (
                                                <svg className="sort-icon">
                                                    <use xlinkHref="/icons/sprite.svg#icon-select-arrows"></use>
                                                </svg>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    const isTooltipColumn =
                                        tooltipColumns.includes(cell.column.id);
                                    return (
                                        <td
                                            key={cell.id}
                                            className={`${
                                                isTooltipColumn ? "tooltip" : ""
                                            }`}
                                            title={
                                                isTooltipColumn
                                                    ? cell.getValue() as string
                                                    : ""
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    {footerRequired && (
                        <tfoot>
                            {table.getFooterGroups().map((footerGroup) => (
                                <tr key={footerGroup.id}>
                                    {footerGroup.headers.map((footer) => (
                                        <td key={footer.id}>
                                            {flexRender(
                                                footer.column.columnDef.footer,
                                                footer.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tfoot>
                    )}
                </table>
            </div>
            <div className="pagination">
                <p className="count">Records : {tableData.length}</p>
                <ul className="pagination__list">
                    <li className="pagination__item">
                        <button
                            className="pagination__btn"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.setPageIndex(0)}
                        >
                            <svg className="pagination__icon">
                                <use xlinkHref="/icons/sprite.svg#icon-chevrons-left"></use>
                            </svg>
                        </button>
                    </li>
                    <li className="pagination__item">
                        <button
                            className="pagination__btn"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                        >
                            <svg className="pagination__icon">
                                <use xlinkHref="/icons/sprite.svg#icon-chevron-left"></use>
                            </svg>
                        </button>
                    </li>
                    <li className="pagination__item">
                        <input
                            type="number"
                            className="input pagination__input"
                            min={1}
                            max={table.getPageCount()}
                            value={table.getState().pagination.pageIndex + 1}
                            onChange={(e) => {
                                const pageIndex = e.target.value
                                    ? Number(e.target.value) - 1
                                    : 0;
                                table.setPageIndex(pageIndex);
                            }}
                        />
                        <span>of {table.getPageCount()}</span>
                    </li>
                    <li className="pagination__item">
                        <button
                            className="pagination__btn"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.nextPage()}
                        >
                            <svg className="pagination__icon">
                                <use xlinkHref="/icons/sprite.svg#icon-chevron-right"></use>
                            </svg>
                        </button>
                    </li>
                    <li className="pagination__item">
                        <button
                            className="pagination__btn"
                            disabled={!table.getCanNextPage()}
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                        >
                            <svg className="pagination__icon">
                                <use xlinkHref="/icons/sprite.svg#icon-chevrons-right"></use>
                            </svg>
                        </button>
                    </li>
                    <li className="pagination__item">
                        <button
                            className="btn btn--download"
                            disabled={tableData.length === 0}
                            onClick={() => handleExport(tableData, reportName)}
                        >
                            <svg className="download-icon">
                                <use xlinkHref="/icons/sprite.svg#icon-download"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Grid;