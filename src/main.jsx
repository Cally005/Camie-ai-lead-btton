import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { FloatingButton } from "./buttons/FloatingButton";
import { ThemeProvider } from "./components/ui/theme-provider";
import App from "./App";

// Create a Root Layout component
function RootLayout() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="app-container">
        <App campaign_id={"29e4fed1-de1b-474e-8e0e-a3bbd21a7d76"} />
        {/* You can add other components or routes here */}
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
