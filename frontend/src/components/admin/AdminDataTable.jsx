import { useMemo, useState } from "react";

export default function AdminDataTable({ columns, rows }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (!term) return true;
        return columns.some((column) =>
          String(row[column.key] || "").toLowerCase().includes(term),
        );
      })
      .sort((a, b) => {
        const left = String(a[sortKey] || "").toLowerCase();
        const right = String(b[sortKey] || "").toLowerCase();
        const result = left.localeCompare(right, undefined, { numeric: true });
        return sortDirection === "asc" ? result : -result;
      });
  }, [columns, rows, search, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  return (
    <div className="dashboard-section">
      <div className="d-flex justify-content-between gap-3 mb-3 flex-wrap">
        <input
          className="form-control"
          style={{ maxWidth: "320px" }}
          placeholder="Search records..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="table-responsive">
        <table className="table align-middle dashboard-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none text-reset"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {sortKey === column.key && (
                      <i className={`bi ms-1 ${sortDirection === "asc" ? "bi-sort-up" : "bi-sort-down"}`} />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.length > 0 ? visibleRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={safePage <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled>
          Page {safePage} of {totalPages}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={safePage >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
