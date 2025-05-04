import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import axios from 'axios';

const SummarizeRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

SummarizeRouter.post('/summarize', upload.single('report'), async (req, res) => {
    try {
        // Check if the file buffer exists
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'File buffer is missing or file not uploaded' });
        }

        // Extract text from PDF
        const pdfBuffer = req.file.buffer;
        let pdfData;
        try {
            pdfData = await pdfParse(pdfBuffer);
        } catch (parseError) {
            return res.status(400).json({ error: 'Failed to parse PDF' });
        }

        const extractedText = pdfData.text.replace(/\n\s*\n/g, '\n').trim();

        // Send extracted text to Python service
        try {
            const response = await axios.post('http://127.0.0.1:5001/summarize', { text: extractedText });
            return res.json({ summary: response.data.summary });
        } catch (error) {
            console.error('Error communicating with Python service:', error);
            return res.status(500).json({ error: 'Failed to summarize text' });
        }
    } catch (error) {
        console.error('Error summarizing report:', error);
        res.status(500).json({ error: 'Failed to summarize report' });
    }
});

export default SummarizeRouter;