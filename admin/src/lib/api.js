import axiosInstance from "./axios";

export const productApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/products");
    return data;
  },

  create: async (formData) => {
    const { data } = await axiosInstance.post("/admin/products", formData);
    return data;
  },

  update: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(`/admin/products/${id}`, formData);
    return data;
  },
   delete: async (productId) => {
    const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
    return data;
  },
};

export const orderApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/orders");
    return data;
  },

  updateStatus: async ({ orderId, status }) => {
    const { data } = await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
    return data;
  },
  
};

export const statsApi = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/admin/stats");
    return data;
  },

  getRevenueLast7Days: async () => {
    const { data } = await axiosInstance.get("/admin/stats/revenue");
    return data;
  },

  getTopProducts: async () => {
    const { data } = await axiosInstance.get("/admin/stats/top-products");
    return data;
  },

  getOrderStatus: async () => {
    const { data } = await axiosInstance.get("/admin/stats/order-status");
    return data;
  },
};

export const customerApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/customers");
    return data;
  },
};
/* ================= COUPONS ✅ FIX ================= */
export const couponApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/coupons");
    return data.coupons;
  },

  create: async (payload) => {
    const { data } = await axiosInstance.post("/admin/coupons", payload);
    return data;
  },

  update: async ({ id, data: payload }) => {
    const { data } = await axiosInstance.put(
      `/admin/coupons/${id}`,
      payload
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/admin/coupons/${id}`);
    return data;
  },
};