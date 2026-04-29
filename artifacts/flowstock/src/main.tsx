import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    routerPush={(to) => {
      const path = stripBase(to);
      window.history.pushState({}, "", basePath + path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }}
    routerReplace={(to) => {
      const path = stripBase(to);
      window.history.replaceState({}, "", basePath + path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }}
  >
    <App />
  </ClerkProvider>
);
