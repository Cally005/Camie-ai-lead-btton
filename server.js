import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend from Vite
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.post("/api/data", (req, res) => {
  console.log("Received Data:", req.body);
  res.status(200).json({ status: true, message: "Data received successfully" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));



// import express from 'express';

// const app = express();
// app.use(express.json());

// app.post('/api/track', (req, res) => {
//   const visitorData = req.body;
//   console.log('Visitor Data:', visitorData);
//   res.status(200).json({ message: 'Visitor data logged' });
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
