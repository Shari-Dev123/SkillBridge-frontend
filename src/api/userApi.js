import axiosInstance from "./axiosInstance.js";

// Get my profile
export const getProfileApi = async () => {
  const res = await axiosInstance.get("/users/profile");
  return res.data;
};

// Update profile
export const updateProfileApi = async (data) => {
  const res = await axiosInstance.put("/users/profile", data);
  return res.data;
};

// Upload avatar
export const uploadAvatarApi = async (formData) => {
  const res = await axiosInstance.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Get seller public profile
export const getSellerProfileApi = async (id) => {
  const res = await axiosInstance.get(`/users/seller/${id}`);
  return res.data;
};

// Update seller profile
export const updateSellerProfileApi = async (data) => {
  const res = await axiosInstance.put("/users/seller-profile", data);
  return res.data;
};

// Update availability
export const updateAvailabilityApi = async (data) => {
  const res = await axiosInstance.put("/users/availability", data);
  return res.data;
};

// Get seller availability (public)
export const getSellerAvailabilityApi = async (id) => {
  const res = await axiosInstance.get(`/users/seller/${id}/availability`);
  return res.data;
};