import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { FloatingButton } from "./buttons/FloatingButton";
import { ThemeProvider } from "./components/ui/theme-provider";
import App from "./App";

// Create a Root Layout component
function RootLayout({ campaign_id }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="app-container">
        <App campaign_id={campaign_id} />
      </div>
    </ThemeProvider>
  );
}

// Replace the existing App import with the RootLayout
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootLayout />
  </React.StrictMode>
);
