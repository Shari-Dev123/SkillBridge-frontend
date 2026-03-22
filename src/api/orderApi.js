import axiosInstance from "./axiosInstance.js";

export const placeOrderApi = async (data) => {
  const res = await axiosInstance.post("/orders", data);
  return res.data;
};

export const payOrderApi = async (id, cardData) => {
  const res = await axiosInstance.post(`/orders/${id}/pay`, cardData);
  return res.data;
};

export const getOrderByIdApi = async (id) => {
  const res = await axiosInstance.get(`/orders/${id}`);
  return res.data;
};

export const getBuyerOrdersApi = async (params) => {
  const res = await axiosInstance.get("/orders/buyer", { params });
  return res.data;
};

export const getSellerOrdersApi = async (params) => {
  const res = await axiosInstance.get("/orders/seller", { params });
  return res.data;
};

export const updateOrderStatusApi = async (id, status) => {
  const res = await axiosInstance.patch(`/orders/${id}/status`, { status });
  return res.data;
};

// Admin
export const getAdminPendingOrdersApi = async (params) => {
  const res = await axiosInstance.get("/orders/admin/pending", { params });
  return res.data;
};

export const getAdminAllOrdersApi = async (params) => {
  const res = await axiosInstance.get("/orders/admin/all", { params });
  return res.data;
};

export const approveOrderApi = async (id) => {
  const res = await axiosInstance.patch(`/orders/${id}/approve`);
  return res.data;
};

export const rejectOrderApi = async (id) => {
  const res = await axiosInstance.patch(`/orders/${id}/reject`);
  return res.data;
};