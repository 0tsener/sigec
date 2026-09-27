"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DataOverviewChartProps {
  metrics: {
    totalClientes: number;
    totalEmpleados: number;
    totalServicios: number;
  };
}

export function DataOverviewChart({ metrics }: DataOverviewChartProps) {
  const data = [
    {
      name: "Clientes",
      value: metrics.totalClientes,
      fill: "#3b82f6",
    },
    {
      name: "Empleados",
      value: metrics.totalEmpleados,
      fill: "#8b5cf6",
    },
    {
      name: "Servicios",
      value: metrics.totalServicios,
      fill: "#10b981",
    },
  ];

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "currentColor", strokeOpacity: 0.1 }}
          />
          <YAxis
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "currentColor", strokeOpacity: 0.1 }}
            domain={[0, maxValue * 1.2]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "hsl(var(--foreground))" }}
            iconType="circle"
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
