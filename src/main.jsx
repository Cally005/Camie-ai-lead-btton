import React from "react";
import "./index.css";
import ReactDOM from "react-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import App from "./App";

// Create a Root Layout component
function camieAIFloatingButton({ campaign_id }) {
  console.log("Initializing Button Widget with: " + campaign_id);

  if (!campaign_id) {
    console.warn("Campaign Id must be provided, contact the developer.");
    return;
  }

  if (document.getElementById("camie-ai-widget-container")) {
    console.warn("Camie AI already initialized.");
    return;
  }

  const container = document.createElement("div");
  container.id = "camie-ai-widget-container";
  document.body.appendChild(container);
  console.log("Camie AI root container added");

  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
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
    </React.StrictMode>
  );
}

if (typeof window !== "undefined") {
  window.camieAIFloatingButton = camieAIFloatingButton;
}
