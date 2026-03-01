import { orderApi } from "../lib/api";
import { formatDate } from "../lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <p className="text-base-content/70">
          Quản lý đơn hàng của khách
        </p>
      </div>

      {/* ORDERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">
                Chưa có đơn hàng nào
              </p>
              <p className="text-sm">
                Đơn hàng sẽ xuất hiện khi khách hàng mua sắm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr key={order._id}>
                        <td className="font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>

                        <td>
                          <div className="font-medium">
                            {order.shippingAddress.fullName}
                          </div>
                          <div className="text-sm opacity-60">
                            {order.shippingAddress.city}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium">
                            {totalQuantity} sản phẩm
                          </div>
                          <div className="text-sm opacity-60">
                            {order.orderItems[0]?.name}
                            {order.orderItems.length > 1 &&
                              ` +${order.orderItems.length - 1} sản phẩm`}
                          </div>
                        </td>

                        <td className="font-semibold">
                          {order.totalPrice.toLocaleString()} ₫
                        </td>

                        <td>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            className="select select-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                          </select>
                        </td>

                        <td className="text-sm opacity-60">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;