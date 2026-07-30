"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CapitalCurveChart({
  data,
  drawdownArea,
}: {
  data: { label: string; capital: number }[];
  drawdownArea?: { x1: string; x2: string } | null;
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-neutral-500">
        Sem operações registradas ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="label" stroke="#737373" fontSize={12} />
        <YAxis
          stroke="#737373"
          fontSize={12}
          tickFormatter={(v: number) =>
            v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
          }
        />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #404040",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#e5e5e5" }}
          formatter={(value) => [
            Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            "Capital",
          ]}
        />
        {drawdownArea && (
          <ReferenceArea
            x1={drawdownArea.x1}
            x2={drawdownArea.x2}
            fill="#ef4444"
            fillOpacity={0.15}
            stroke="#ef4444"
            strokeOpacity={0.4}
          />
        )}
        <Line type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
