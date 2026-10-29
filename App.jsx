import React from "react";
import DataTable from "./components/DataTable";
import { initialColumns, initialRows } from "./data/mockData";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Team Directory Table
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Double-click any cell to edit data inline. Click table headers to sort.
          </p>
        </div>

        <DataTable initialColumns={initialColumns} initialRows={initialRows} />
      </div>
    </div>
  );
}