import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Throw the error so React Query can catch it
    return Promise.reject(error);
  }
);

export default api;
