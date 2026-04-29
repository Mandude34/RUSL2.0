import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error("VITE_API_URL environment variable is not set");
}
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
