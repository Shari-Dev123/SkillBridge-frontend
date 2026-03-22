import axiosInstance from "./axiosInstance.js";

// Submit review
export const submitReviewApi = async (data) => {
  const res = await axiosInstance.post("/reviews", data);
  return res.data;
};

// Get gig reviews
export const getGigReviewsApi = async (gigId, params) => {
  const res = await axiosInstance.get(`/reviews/gig/${gigId}`, { params });
  return res.data;
};

// Get seller reviews
export const getSellerReviewsApi = async (sellerId, params) => {
  const res = await axiosInstance.get(`/reviews/seller/${sellerId}`, {
    params,
  });
  return res.data;
};

// Delete review
export const deleteReviewApi = async (id) => {
  const res = await axiosInstance.delete(`/reviews/${id}`);
  return res.data;
};