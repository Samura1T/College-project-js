const Emotion = require('../models/emotion.model');

// Функция сохранения эмоции с камеры
exports.analyzeFrame = async (req, res) => {
    try {
        const { label, confidence } = req.body;

        // Создаем новую запись в базе
        const newEmotion = new Emotion({
            label: label,
            confidence: confidence
        });

        await newEmotion.save(); // Сохраняем в MongoDB

        res.status(200).json({ message: "the emotion is saved!" });
    } catch (error) {
        console.error("saving error:", error);
        res.status(500).json({ message: "server error" });
    }
};