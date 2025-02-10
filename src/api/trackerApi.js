import axios from "axios";

/**
 * Sends visitor data to the backend server.
 * @param {Object} visitorData - The visitor data to be sent.
 * @param {string} visitorData.ip - The visitor's IP address.
 * @param {string} visitorData.userAgent - The visitor's browser User-Agent string.
 * @param {string} visitorData.platform - The visitor's device platform.
 * @param {string} visitorData.language - The visitor's browser language.
 * @param {string} visitorData.screenResolution - The visitor's screen resolution.
 * @param {string} visitorData.timestamp - The time of the visit.
 */
export const sendVisitorData = async (visitorData) => {
  try {
    const response = await axios.post("http://localhost:3000/api/track", visitorData);
    console.log("Visitor data sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending visitor data:", error);
  }
};
