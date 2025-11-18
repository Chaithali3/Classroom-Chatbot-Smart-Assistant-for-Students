
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { initTheme } from "./utils/theme";
  import "./styles/dark-overrides.css";

  // Initialize theme (reads localStorage or system preference)
  initTheme();

  createRoot(document.getElementById("root")!).render(<App />);
  