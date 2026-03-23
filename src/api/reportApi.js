import axiosInstance from "./axiosInstance.js";

// Submit a report
export const submitReportApi = (data) =>
  axiosInstance.post("/reports", data).then((r) => r.data);

// Check if already reported
export const checkMyReportApi = (orderId, reportedUserId) =>
  axiosInstance
    .get("/reports/check", { params: { orderId, reportedUserId } })
    .then((r) => r.data);

// Admin: get all reports
export const getAllReportsApi = (params) =>
  axiosInstance.get("/reports", { params }).then((r) => r.data);

// Admin: update report status
export const updateReportStatusApi = ({ id, status, adminNote }) =>
  axiosInstance.patch(`/reports/${id}/status`, { status, adminNote }).then((r) => r.data);

// Admin: delete reported user
export const deleteReportedUserApi = (userId) =>
  axiosInstance.delete(`/reports/user/${userId}`).then((r) => r.data);