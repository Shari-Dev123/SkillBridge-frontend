import axiosInstance from "./axiosInstance.js";

// Register
export const registerApi = async (data) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

// Login
export const loginApi = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

// Get current user
export const getMeApi = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

// Update password
export const updatePasswordApi = async (data) => {
  const res = await axiosInstance.put("/auth/update-password", data);
  return res.data;
};