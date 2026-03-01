import { useQuery } from "@tanstack/react-query";
import { orderApi, statsApi } from "../lib/api";
import {
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "lucide-react";
import {
  capitalizeText,
  formatDate,
  getOrderStatusBadge,
} from "../lib/utils";

import RevenueChart from "../components/RevenueChart";
import { TopProductsChart } from "../components/TopProductsChart";
import { OrderStatusChart } from "../components/OrderStatusChart";

function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue7days"],
    queryFn: statsApi.getRevenueLast7Days,
  });

  const { data: topProductsData } = useQuery({
    queryKey: ["topProducts"],
    queryFn: statsApi.getTopProducts,
  });

  const { data: orderStatusData } = useQuery({
    queryKey: ["orderStatusStats"],
    queryFn: statsApi.getOrderStatus,
  });

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const statsCards = [
    {
      name: "Tổng doanh thu",
      value: statsLoading
        ? "..."
        : `${statsData?.totalRevenue?.toLocaleString()} ₫`,
      icon: <DollarSignIcon className="size-8" />,
    },
    {
      name: "Tổng đơn hàng",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" />,
    },
    {
      name: "Khách hàng",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-8" />,
    },
    {
      name: "Sản phẩm",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <PackageIcon className="size-8" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
        {statsCards.map((stat) => (
          <div key={stat.name} className="stat">
            <div className="stat-figure text-primary">{stat.icon}</div>
            <div className="stat-title">{stat.name}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData || []} />
        <OrderStatusChart data={orderStatusData || []} />
      </div>

      <div className="grid grid-cols-1">
        <TopProductsChart data={topProductsData || []} />
      </div>

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Đơn hàng gần đây</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Thành tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>

                      <td>
                        <div>
                          <div className="font-medium">
                            {order.shippingAddress.fullName}
                          </div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} sản phẩm
                          </div>
                        </div>
                      </td>

                      <td className="text-sm">
                        {order.orderItems[0]?.name}
                        {order.orderItems.length > 1 &&
                          ` +${order.orderItems.length - 1} sản phẩm`}
                      </td>

                      <td className="font-semibold">
                        {order.totalPrice.toLocaleString()} ₫
                      </td>

                      <td>
                        <div
                          className={`badge ${getOrderStatusBadge(
                            order.status
                          )}`}
                        >
                          {capitalizeText(order.status)}
                        </div>
                      </td>

                      <td className="text-sm opacity-60">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;