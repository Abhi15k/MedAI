import express from 'express';

const SummarizeRouter = express.Router();

// Demo route for summarization
SummarizeRouter.post('/summarize', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for summarization' });
    }

    // Dummy summarization logic
    const summary = text.split(' ').slice(0, 10).join(' ') + '...';

    res.json({ summary });
});

export default SummarizeRouter;