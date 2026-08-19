import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initMediaCache } from "./app/lib/mediaCache.ts";

  initMediaCache();

  createRoot(document.getElementById("root")!).render(<App />);