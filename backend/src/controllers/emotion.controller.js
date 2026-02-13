const EmotionService = require('../services/emotion.service');
const MLService = require('../services/ml.service');

// Принимаем данные от AI и сохраняем
exports.saveEmotion = async (req, res) => {
    try {
        const { label, confidence, box, metadata } = req.body;

        // 1. Проверяем через ML сервис, не мусор ли это
        if (!MLService.isReliable(confidence)) {
            return res.status(200).json({ 
                success: false, 
                message: "Skipped: Low confidence (Nervous network is unsure)" 
            });
        }

        // 2. Форматируем данные (happy -> Happy)
        const cleanLabel = MLService.formatLabel(label);

        // 3. Сохраняем через сервис БД
        const savedData = await EmotionService.save({
            label: cleanLabel,
            confidence,
            box,
            metadata
        });

        // 4. Отвечаем фронтенду
        res.status(201).json({
            success: true,
            data: savedData
        });

    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Отдаем историю для графиков
exports.getEmotions = async (req, res) => {
    try {
        const data = await EmotionService.getHistory();
        
        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};