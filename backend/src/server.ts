import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('Server starting... Loading environment.');
dotenv.config();

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
