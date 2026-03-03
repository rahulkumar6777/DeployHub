// src/api/apiClient.js

import axios from "axios";
import { BaseUrl } from "./ApiUrl";

export const api = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
});

export const attachInterceptors = (
  getToken,
  refreshToken,
  logout
) => {
  const requestInterceptor = api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const responseInterceptor = api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }

      if (original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;

      const newToken = await refreshToken();

      if (!newToken) {
        logout();
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
  );

  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};