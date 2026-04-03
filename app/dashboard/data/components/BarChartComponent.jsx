// app/dashboard/data/components/BarChartComponent.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BarChartComponent({ data, xAxisDataKey, barDataKey, fill = "#3b5bdb" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" />
        <XAxis dataKey={xAxisDataKey} tick={{ fontSize: 12, fill: "#aaa" }} />
        <YAxis domain={[0, 7]} tick={{ fontSize: 12, fill: "#aaa" }} />
        <Tooltip
          formatter={(value, name) => [value, "Promedio"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e8e8e3", fontSize: 13 }}
        />
        <Bar dataKey={barDataKey} fill={fill} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}