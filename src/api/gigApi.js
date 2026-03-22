import axiosInstance from "./axiosInstance.js";

// Get all gigs (browse + search + filter)
export const getGigsApi = async (params) => {
  const res = await axiosInstance.get("/gigs", { params });
  return res.data;
};

// Get single gig by slug
export const getGigBySlugApi = async (slug) => {
  const res = await axiosInstance.get(`/gigs/${slug}`);
  return res.data;
};

// Get my gigs (seller)
export const getMyGigsApi = async () => {
  const res = await axiosInstance.get("/gigs/my-gigs");
  return res.data;
};

// Create gig
export const createGigApi = async (formData) => {
  const res = await axiosInstance.post("/gigs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update gig
export const updateGigApi = async (id, formData) => {
  const res = await axiosInstance.put(`/gigs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete gig
export const deleteGigApi = async (id) => {
  const res = await axiosInstance.delete(`/gigs/${id}`);
  return res.data;
};