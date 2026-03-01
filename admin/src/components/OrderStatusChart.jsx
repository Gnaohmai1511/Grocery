import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#facc15", "#3b82f6", "#22c55e", "#ef4444"];

// map trạng thái -> tiếng Việt
const STATUS_LABEL = {
  pending: "Chờ xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
};

export function OrderStatusChart({ data = [] }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Trạng thái đơn hàng</h2>

        <div className="h-72 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map((item) => ({
                  ...item,
                  statusLabel: STATUS_LABEL[item.status] || item.status,
                }))}
                dataKey="count"
                nameKey="statusLabel"
                outerRadius={90}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, _name, props) => [
                  value,
                  props.payload.statusLabel,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}