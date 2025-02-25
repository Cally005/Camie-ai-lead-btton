import axios from "axios";

export const sendVisitorData = async (formData) => {
  try {
    const response = await axios.post("http://localhost:3000/api/data", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Submitted:", response.data.data);
  } catch (error) {
    console.error("Error sending visitor data:", error);
  }
};
