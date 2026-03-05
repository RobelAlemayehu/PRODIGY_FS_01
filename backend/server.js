const connectDB = require('./config/db');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

