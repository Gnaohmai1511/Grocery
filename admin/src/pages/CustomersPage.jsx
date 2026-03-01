import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../lib/api";
import { formatDate } from "../lib/utils";

function CustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const customers = data?.customers || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Khách hàng</h1>
        <p className="text-base-content/70 mt-1">
          {customers.length} khách hàng đã đăng ký
        </p>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">
                Chưa có khách hàng nào
              </p>
              <p className="text-sm">
                Khách hàng sẽ xuất hiện sau khi đăng ký tài khoản
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Yêu thích</th>
                    <th>Ngày tham gia</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-12">
                            <img
                              src={customer.imageUrl}
                              alt={customer.name}
                              className="w-12 h-12 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="font-semibold">{customer.name}</div>
                      </td>

                      <td>{customer.email}</td>

                      <td>
                        <div className="badge badge-ghost">
                          {customer.addresses?.length || 0} địa chỉ
                        </div>
                      </td>

                      <td>
                        <div className="badge badge-ghost">
                          {customer.wishlist?.length || 0} sản phẩm
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">
                          {formatDate(customer.createdAt)}
                        </span>
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

export default CustomersPage;