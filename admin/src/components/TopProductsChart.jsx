import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function TopProductsChart({ data = [] }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Sản phẩm bán chạy</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis />

              <Tooltip
                formatter={(value) => [`${value} sản phẩm`, "Đã bán"]}
                labelFormatter={(label) => `Sản phẩm: ${label}`}
              />

              <Bar
                dataKey="sold"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                name="Số lượng đã bán"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}