// src/api/apiClient.js

import axios from "axios";
import { BaseUrl } from "./ApiUrl";

export const api = axios.create({
  baseURL: BaseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribe(cb) {
  refreshSubscribers.push(cb);
}

function notify(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export const attachInterceptors = (
  getToken,
  refreshToken,
  logout
) => {
  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  );

  const responseInterceptor = api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      if (!error.response) {
        return Promise.reject(error);
      }

      // ❌ Never retry refresh endpoint
      if (original.url.includes("/refresh")) {
        logout(false);
        return Promise.reject(error);
      }

      if (error.response.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribe((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        if (!newToken) throw new Error();

        notify(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        logout(false);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
  );

  // Return eject function
  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};