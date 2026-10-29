import React, { useState, useMemo } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus 
} from "lucide-react";

export default function DataTable({ initialColumns, initialRows }) {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(initialRows);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnKey }
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 1. Sorting Handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  // 2. Filter & Sort Pipeline
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    // Global Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortConfig.direction === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [rows, searchQuery, sortConfig]);

  // 3. Pagination Slicing
  const totalPages = Math.ceil(filteredAndSortedRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRows.slice(start, start + rowsPerPage);
  }, [filteredAndSortedRows, currentPage]);

  // 4. In-line Cell Update
  const handleCellChange = (rowId, key, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
    );
  };

  // 5. Row Add & Delete
  const handleAddRow = () => {
    const newRow = { id: Date.now() };
    columns.forEach((col) => {
      newRow[col.key] = col.type === "number" ? 0 : "New Entry";
    });
    setRows([newRow, ...rows]);
  };

  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Helper to render badge styles
  const getBadgeClass = (status) => {
    switch (String(status).toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "inactive":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3.5 cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <span className="text-slate-400">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3.5 text-right w-16">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col) => {
                    const isEditing =
                      editingCell?.rowId === row.id &&
                      editingCell?.columnKey === col.key;

                    return (
                      <td
                        key={col.key}
                        className="px-6 py-3.5 cursor-pointer"
                        onDoubleClick={() =>
                          setEditingCell({ rowId: row.id, columnKey: col.key })
                        }
                      >
                        {isEditing ? (
                          <input
                            type={col.type === "number" ? "number" : "text"}
                            autoFocus
                            defaultValue={row[col.key]}
                            onBlur={(e) => {
                              handleCellChange(
                                row.id,
                                col.key,
                                col.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value
                              );
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.target.blur();
                            }}
                            className="w-full px-2 py-1 text-sm border border-blue-500 rounded bg-blue-50/30 focus:outline-none"
                          />
                        ) : col.type === "badge" ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeClass(
                              row[col.key]
                            )}`}
                          >
                            {row[col.key]}
                          </span>
                        ) : col.type === "number" ? (
                          <span>{Number(row[col.key]).toLocaleString()}</span>
                        ) : (
                          <span>{row[col.key]}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-10 text-center text-slate-400 text-sm"
                >
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
        <div>
          Showing{" "}
          <span className="font-medium text-slate-700">
            {filteredAndSortedRows.length === 0
              ? 0
              : (currentPage - 1) * rowsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-700">
            {Math.min(currentPage * rowsPerPage, filteredAndSortedRows.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {filteredAndSortedRows.length}
          </span>{" "}
          results
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}