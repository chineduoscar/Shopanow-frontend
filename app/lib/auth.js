import Cookies from "js-cookie";

export const getTokenClaims = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const getTokenExp = (token) => {
  const exp = getTokenClaims(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
};

export const getTokenName = (token) => {
  const fullName = getTokenClaims(token)?.fullName;
  return typeof fullName === "string" ? fullName.trim() : "";
};

export const clearToken = () => Cookies.remove("token");
