import mlService from './ml.service.js';
import videoService from './video.service.js';
import Logger from '../utils/logger.js';

const logger = new Logger();

class EmotionService {
  constructor() {
    this.emotionTypes = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];
  }

  /**
   * Анализ эмоций из изображения
   * @param {string} imagePath - путь к изображению
   * @param {number} cameraId - ID камеры
   * @returns {Promise<Object>}
   */
  async analyzeImage(imagePath, cameraId) {
    try {
      logger.log(`Analyzing image: ${imagePath} from camera ${cameraId}`);

      // Вызываем ML-сервис для анализа
      const mlResult = await mlService.analyzeEmotion(imagePath);

      // Формируем результат
      const result = {
        camera_id: cameraId,
        timestamp: new Date(),
        emotions: mlResult.emotions,
        dominant_emotion: mlResult.dominant_emotion,
        confidence: mlResult.confidence,
        face_detected: mlResult.face_detected,
        frame_url: imagePath
      };

      logger.log(`Emotion detected: ${result.dominant_emotion} (${result.confidence})`);
      return result;

    } catch (error) {
      logger.error(`Image analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Анализ эмоций из видео
   * @param {string} videoPath - путь к видео
   * @param {number} cameraId - ID камеры
   * @returns {Promise<Array>}
   */
  async analyzeVideo(videoPath, cameraId) {
    try {
      logger.log(`Analyzing video: ${videoPath}`);

      // Извлекаем кадры из видео
      const frames = await videoService.extractFrames(videoPath, {
        frameRate: 1,
        maxFrames: 30
      });

      logger.log(`Extracted ${frames.length} frames from video`);

      // Анализируем каждый кадр
      const results = [];
      for (const frame of frames) {
        const analysis = await this.analyzeImage(frame, cameraId);
        results.push(analysis);
      }

      return results;

    } catch (error) {
      logger.error(`Video analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Анализ эмоций из потока камеры (base64)
   * @param {string} base64Image - изображение в base64
   * @param {number} cameraId - ID камеры
   * @returns {Promise<Object>}
   */
  async analyzeStream(base64Image, cameraId) {
    try {
      // Конвертируем base64 в файл
      const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const tempPath = `uploads/frames/stream_${Date.now()}.jpg`;
      
      await require('fs/promises').writeFile(tempPath, buffer);

      // Анализируем изображение
      const result = await this.analyzeImage(tempPath, cameraId);

      return result;

    } catch (error) {
      logger.error(`Stream analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получение статистики эмоций за период
   * @param {number} cameraId - ID камеры
   * @param {Date} startDate - начальная дата
   * @param {Date} endDate - конечная дата
   * @returns {Promise<Object>}
   */
  async getEmotionStats(cameraId, startDate, endDate) {
    try {
      // TODO: Получить данные из БД
      // Это пример структуры, реальные данные будут из MySQL/MongoDB

      const stats = {
        camera_id: cameraId,
        period: {
          start: startDate,
          end: endDate
        },
        total_detections: 0,
        emotions_summary: {
          happy: 0,
          sad: 0,
          angry: 0,
          fear: 0,
          surprise: 0,
          disgust: 0,
          neutral: 0
        },
        dominant_emotion: 'neutral',
        average_confidence: 0
      };

      return stats;

    } catch (error) {
      logger.error(`Stats error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Определение доминирующей эмоции
   * @param {Object} emotions - объект с процентами эмоций
   * @returns {Object} - {emotion, confidence}
   */
  getDominantEmotion(emotions) {
    let maxEmotion = 'neutral';
    let maxValue = 0;

    for (const [emotion, value] of Object.entries(emotions)) {
      if (value > maxValue) {
        maxValue = value;
        maxEmotion = emotion;
      }
    }

    return {
      emotion: maxEmotion,
      confidence: maxValue
    };
  }

  /**
   * Валидация результатов эмоций
   * @param {Object} emotions - объект эмоций
   * @returns {boolean}
   */
  validateEmotions(emotions) {
    const sum = Object.values(emotions).reduce((a, b) => a + b, 0);
    return Math.abs(sum - 1.0) < 0.01; // Сумма должна быть ≈ 1.0
  }
}

export default new EmotionService();