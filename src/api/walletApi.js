import axiosInstance from "./axiosInstance.js";

export const getBuyerWalletApi = async () => {
  const res = await axiosInstance.get("/wallet/buyer");
  return res.data;
};

export const buyerTopUpApi = async (amount) => {
  const res = await axiosInstance.post("/wallet/buyer/topup", { amount });
  return res.data;
};

export const getSellerWalletApi = async () => {
  const res = await axiosInstance.get("/wallet/seller");
  return res.data;
};

export const sellerWithdrawApi = async (amount) => {
  const res = await axiosInstance.post("/wallet/seller/withdraw", { amount });
  return res.data;
};