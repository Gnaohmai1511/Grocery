import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const formatDay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function RevenueChart({ data = [] }) {
  const chartData = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((item) => ({
        date: item?.date,
        revenue: Number(item?.revenue) || 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Doanh thu (7 ngày gần nhất)</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDay} />
              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `${Number(value).toLocaleString("vi-VN")} ₫`
                }
                labelFormatter={(label) => `Ngày ${formatDay(label)}`}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}