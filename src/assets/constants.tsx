const isLocalNetwork = () => {
  const localIPs = ["localhost", "127.0.0.1"]; // Add more if needed
  const hostname = window.location.hostname;

  // Check if the hostname is a local IP or part of a private network
  if (
    localIPs.includes(hostname) ||
    hostname.startsWith("192.168.")
  ) {
    return true; // Inside local network
  }
  return false; // Outside (public network)
};

export const url = isLocalNetwork()
  ? import.meta.env.VITE_API_URL_LOCAL
  : import.meta.env.VITE_API_URL;

export const storageUrl = isLocalNetwork()
  ? import.meta.env.VITE_API_STORAGE_URL_LOCAL
  : import.meta.env.VITE_API_STORAGE_URL;

export const colorPrimary = "#264653";
export const colorSecondary = "#2a9d8f";
export const colorGreyLight1 = "#faf9f9";
export const colorGreyLight2 = "#f4f2f2";
export const colorGreyLight3 = "#f0eeee";
export const colorGreyLight4 = "#ccc";
export const colorGreyDark2 = "#777";
export const colorGreyDark3 = "#999";
export const menus = {
  Dashboard: "Dashboard",
  User: "User",
  Purpose: "Purpose",
  Contact: "Contact",
  Distributor: "Distributor",
  Visit: "Visit",
  Order: "Order",
};
