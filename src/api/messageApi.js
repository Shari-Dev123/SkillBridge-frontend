import axiosInstance from "./axiosInstance.js";

// Get messages of an order
export const getMessagesApi = async (orderId) => {
  const res = await axiosInstance.get(`/messages/${orderId}`);
  return res.data;
};

// Send message
export const sendMessageApi = async (orderId, text) => {
  const res = await axiosInstance.post(`/messages/${orderId}`, { text });
  return res.data;
};

// Get unread count
export const getUnreadCountApi = async () => {
  const res = await axiosInstance.get("/messages/unread-count");
  return res.data;
};