const Camera = require('../models/camera.model'); // Для простого создания/чтения
const VideoService = require('../services/video.service'); // Для сложной логики (Online/Offline)

// Получить список всех камер
exports.getAllCameras = async (req, res) => {
    try {
        const cameras = await Camera.find();
        res.status(200).json({ success: true, data: cameras });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Добавить новую камеру
exports.registerCamera = async (req, res) => {
    try {
        const newCamera = await Camera.create(req.body);
        res.status(201).json({ success: true, data: newCamera });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Включить камеру (через сервис)
exports.setOnline = async (req, res) => {
    try {
        const { id } = req.params;
        const { streamUrl } = req.body;
        
        // Вызываем сервис
        const updatedCamera = await VideoService.setCameraOnline(id, streamUrl);
        
        res.status(200).json({ success: true, status: 'ONLINE', data: updatedCamera });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Выключить камеру (через сервис)
exports.setOffline = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Вызываем сервис
        const updatedCamera = await VideoService.setCameraOffline(id);
        
        res.status(200).json({ success: true, status: 'OFFLINE', data: updatedCamera });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};