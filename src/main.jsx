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
        <App campaign_id={"b220297e-c639-4cd1-8ed9-4ea60cf386c5"} />
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
