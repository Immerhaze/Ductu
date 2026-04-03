// app/dashboard/data/components/LineChartComponent.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LineChartComponent({ data, xAxisDataKey, lineDataKey, stroke = "#3b5bdb" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" />
        <XAxis dataKey={xAxisDataKey} tick={{ fontSize: 12, fill: "#aaa" }} />
        <YAxis domain={[0, 7]} tick={{ fontSize: 12, fill: "#aaa" }} />
        <Tooltip
          formatter={(value) => [value, "Promedio"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e8e8e3", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey={lineDataKey}
          stroke={stroke}
          strokeWidth={2}
          dot={{ r: 4, fill: stroke }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}