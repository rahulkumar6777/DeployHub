// src/api/apiClient.js

import axios from "axios";
import { BaseUrl } from "./ApiUrl";

export const api = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
});

/* =====================================================
   Refresh State Management
===================================================== */

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/* =====================================================
   Attach Interceptors
===================================================== */

export const attachInterceptors = (
  getToken,
  refreshToken,
  logout
) => {

  /* -------------------------------
     Request Interceptor
  -------------------------------- */
  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  /* -------------------------------
     Response Interceptor
  -------------------------------- */
  const responseInterceptor = api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config;

      // No response (network error etc.)
      if (!error.response) {
        return Promise.reject(error);
      }

      const status = error.response.status;

      // 🚨 Never intercept refresh endpoint itself
      if (originalRequest.url.includes("/refresh")) {
        return Promise.reject(error);
      }

      // Only handle 401
      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      /* --------------------------------
         If refresh already in progress
      -------------------------------- */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      /* --------------------------------
         Start Refresh Process
      -------------------------------- */
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        if (!newToken) {
          throw new Error("Refresh failed");
        }

        // Notify all queued requests
        onRefreshed(newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {

        // Notify waiting requests that refresh failed
        onRefreshed(null);

        logout();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }
  );

  /* -------------------------------
     Eject Function
  -------------------------------- */
  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};