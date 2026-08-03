"use client";

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { DepreciationPoint } from "@/lib/depreciation";

interface DepreciationChartProps {
  points: DepreciationPoint[];
  today: string;
}

export function DepreciationChart({ points, today }: DepreciationChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => formatCurrency(value)}
            width={90}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />

          <ReferenceLine x={today} stroke="#f97316" label={{ value: "We are here", fontSize: 11, fill: "#f97316" }} />
          <Line type="monotone" dataKey="bookValue" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
