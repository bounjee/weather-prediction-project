import express from 'express';
import { ChatService } from '../services/ChatService';

const router = express.Router();
const chatService = new ChatService();

router.post('/', async (req, res) => {
    try {
        const { message, city } = req.body;

        if (!message || !city) {
            res.status(400).json({ error: 'Mesaj ve şehir bilgisi gerekli.' });
            return;
        }

        const response = await chatService.processMessage(message, city);
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Mesaj işlenirken bir hata oluştu.' });
    }
});

export default router;
