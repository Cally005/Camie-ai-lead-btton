export const trackVisitor = async () => {
  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();

    const visitorData = {
      ip,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };

    // Log data to the console instead of sending to the server
    console.log("Visitor Data:", visitorData);
  } catch (error) {
    console.error("Error tracking visitor:", error);
  }
};
