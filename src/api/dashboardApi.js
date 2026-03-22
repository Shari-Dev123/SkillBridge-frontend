import axiosInstance from "./axiosInstance.js";

// Get seller dashboard
export const getSellerDashboardApi = async () => {
  const res = await axiosInstance.get("/dashboard/seller");
  return res.data;
};

// Get buyer dashboard
export const getBuyerDashboardApi = async () => {
  const res = await axiosInstance.get("/dashboard/buyer");
  return res.data;
};