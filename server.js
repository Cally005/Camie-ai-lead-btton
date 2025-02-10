import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/track', (req, res) => {
  const visitorData = req.body;
  console.log('Visitor Data:', visitorData);
  res.status(200).json({ message: 'Visitor data logged' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
