import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

// Model Metrics API - JSON dosyasını oku
app.get('/api/model-metrics', (req, res) => {
    // __dirname compile sonrası dist/src veya ts-node ile src olabilir
    // Her iki durumda da proje root'una ulaşabilmek için birden fazla path dene
    const possiblePaths = [
        path.resolve(__dirname, '../../ai-model/model_metrics_ankara.json'),  // ts-node (src/)
        path.resolve(__dirname, '../../../ai-model/model_metrics_ankara.json'), // compiled (dist/src/)
        path.resolve(process.cwd(), 'ai-model/model_metrics_ankara.json'),      // cwd'den
        path.resolve(process.cwd(), '../ai-model/model_metrics_ankara.json'),   // backend cwd'den
    ];

    let metricsPath: string | null = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            metricsPath = p;
            break;
        }
    }

    console.log(`[API] Denenen pathler:`, possiblePaths);
    console.log(`[API] Bulunan path: ${metricsPath}`);

    if (!metricsPath) {
        return res.status(404).json({
            error: 'Model metrikleri bulunamadı',
            message: 'Lütfen önce modeli eğitin: python train_model.py',
            triedPaths: possiblePaths
        });
    }

    try {
        const metricsData = fs.readFileSync(metricsPath, 'utf-8');
        const metrics = JSON.parse(metricsData);
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: 'Metrikler okunamadı' });
    }
});

// Model Graphs API - Grafik dosyalarını serve et
app.get('/api/model-graph/:filename', (req, res) => {
    const { filename } = req.params;

    const possiblePaths = [
        path.resolve(__dirname, '../../ai-model/training_graphs', filename),
        path.resolve(__dirname, '../../../ai-model/training_graphs', filename),
        path.resolve(process.cwd(), 'ai-model/training_graphs', filename),
        path.resolve(process.cwd(), '../ai-model/training_graphs', filename),
    ];

    let graphPath: string | null = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            graphPath = p;
            break;
        }
    }

    if (!graphPath) {
        return res.status(404).json({ error: 'Grafik bulunamadı', triedPaths: possiblePaths });
    }

    res.sendFile(graphPath);
});

// Static serve for training graphs - cwd üzerinden
const graphsDir = path.resolve(process.cwd(), '../ai-model/training_graphs');
if (fs.existsSync(graphsDir)) {
    app.use('/training-graphs', express.static(graphsDir));
} else {
    app.use('/training-graphs', express.static(path.resolve(process.cwd(), 'ai-model/training_graphs')));
}

app.get('/', (req, res) => {
    res.send('Weather Prediction Bot API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
