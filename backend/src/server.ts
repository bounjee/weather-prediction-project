import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

console.log('Server starting... Loading environment variables.');
// Explicitly point to the .env file in the backend root
// Assuming server.ts is in src/, so we go up one level
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.warn('WARNING: Failed to load .env file. ' + result.error.message);
} else {
    console.log('.env file loaded successfully.');
}

import weatherRoutes from './routes/weather';
import chatRoutes from './routes/chat';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('Weather Prediction Bot API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
