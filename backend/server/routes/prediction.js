import express from 'express';

const PredictionRouter = express.Router();

// Demo prediction route
PredictionRouter.post('/predict', (req, res) => {
    const inputData = req.body;

    // Mock prediction logic
    const predictionResult = {
        success: true,
        input: inputData,
        prediction: "This is a demo prediction result"
    };

    res.json(predictionResult);
});

export default PredictionRouter;
