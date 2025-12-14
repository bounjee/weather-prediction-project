import express from 'express';
import { WeatherService } from '../services/WeatherService';

const router = express.Router();
const weatherService = new WeatherService();

router.get('/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const forecast = await weatherService.getForecast(city);
        res.json({
            city,
            forecast
        });
    } catch (error) {
        res.status(500).json({ error: 'Veri alınırken bir hata oluştu.' });
    }
});

export default router;
