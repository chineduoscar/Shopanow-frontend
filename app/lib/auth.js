import Cookies from "js-cookie";

export const getTokenExp = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return null;
  }
};

export const clearToken = () => Cookies.remove("token");
