"use client";

import { useState } from "react";
import { DisposalRequestsTable } from "@/components/disposalRequests/DisposalRequestsTable";
import { isDateStringInRange } from "@/lib/reportHelpers";
import type { DisposalRequest, DisposalRequestItem, Item, User } from "@/lib/types";

interface DisposalReportViewProps {
  requests: DisposalRequest[];
  requestItemsById: Map<string, DisposalRequestItem[]>;
  itemsById: Map<string, Item>;
  usersById: Map<string, User>;
}

export function DisposalReportView({
  requests,
  requestItemsById,
  itemsById,
  usersById,
}: DisposalReportViewProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<DisposalRequest[]>(requests);

  function handleCreateReport() {
    setResults(
      requests.filter((request) =>
        isDateStringInRange(request.created_at, dateFrom || null, dateTo || null),
      ),
    );
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    setResults(requests);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Generate Report
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCreateReport}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Report
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      <DisposalRequestsTable
        requests={results}
        requestItemsById={requestItemsById}
        itemsById={itemsById}
        usersById={usersById}
      />
    </div>
  );
}
