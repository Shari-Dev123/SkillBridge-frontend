import axiosInstance from "./axiosInstance.js";

// ── User / Seller APIs ────────────────────────────────────────────────────────

export const getProfileApi = async () => {
  const res = await axiosInstance.get("/users/profile");
  return res.data;
};

export const updateProfileApi = async (data) => {
  const res = await axiosInstance.put("/users/profile", data);
  return res.data;
};

export const uploadAvatarApi = async (formData) => {
  const res = await axiosInstance.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getSellerProfileApi = async (id) => {
  const res = await axiosInstance.get(`/users/seller/${id}`);
  return res.data;
};

export const updateSellerProfileApi = async (data) => {
  const res = await axiosInstance.put("/users/seller-profile", data);
  return res.data;
};

export const updateAvailabilityApi = async (data) => {
  const res = await axiosInstance.put("/users/availability", data);
  return res.data;
};

export const getSellerAvailabilityApi = async (id) => {
  const res = await axiosInstance.get(`/users/seller/${id}/availability`);
  return res.data;
};

// ── Admin APIs ────────────────────────────────────────────────────────────────

export const adminGetUsersApi = async ({ search = "", role = "", page = 1, limit = 12 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role)   params.set("role",   role);
  params.set("page",  page);
  params.set("limit", limit);
  const res = await axiosInstance.get(`/users/admin/users?${params.toString()}`);
  return res.data;
};

export const adminDeleteUserApi = async (id) => {
  const res = await axiosInstance.delete(`/users/admin/users/${id}`);
  return res.data;
};

export const adminWarnUserApi = async (id, message) => {
  const res = await axiosInstance.put(`/users/admin/users/${id}/warn`, { message });
  return res.data;
};