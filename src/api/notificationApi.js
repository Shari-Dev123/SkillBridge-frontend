import axiosInstance from "./axiosInstance.js";

export const getNotificationsApi = (params) =>
  axiosInstance.get("/notifications", { params }).then((r) => r.data);

export const getUnreadCountApi = () =>
  axiosInstance.get("/notifications/unread-count").then((r) => r.data);

export const markAsReadApi = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllAsReadApi = () =>
  axiosInstance.patch("/notifications/read-all").then((r) => r.data);

export const deleteNotificationApi = (id) =>
  axiosInstance.delete(`/notifications/${id}`).then((r) => r.data);