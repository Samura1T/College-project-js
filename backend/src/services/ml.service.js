import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import Logger from '../utils/logger.js';

const logger = new Logger();

class MLService {
  constructor() {
    // URL ML-сервиса (Python Flask/FastAPI)
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 30000; // 30 секунд
  }

  /**
   * Анализ эмоций на изображении
   * @param {string} imagePath - путь к изображению
   * @returns {Promise<Object>} - результат распознавания эмоций
   */
  async analyzeEmotion(imagePath) {
    try {
      logger.log(`Analyzing emotion for image: ${imagePath}`);

      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));

      const response = await axios.post(
        `${this.mlServiceUrl}/api/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: this.timeout
        }
      );

      logger.log(`Emotion analysis completed: ${JSON.stringify(response.data)}`);
      return response.data;

    } catch (error) {
      logger.error(`ML Service error: ${error.message}`);
      
      // Возвращаем дефолтные значения при ошибке
      return {
        emotions: {
          happy: 0,
          sad: 0,
          angry: 0,
          fear: 0,
          surprise: 0,
          disgust: 0,
          neutral: 1.0
        },
        dominant_emotion: 'neutral',
        confidence: 0,
        face_detected: false,
        error: error.message
      };
    }
  }

  /**
   * Пакетный анализ эмоций (несколько изображений)
   * @param {Array<string>} imagePaths - массив путей к изображениям
   * @returns {Promise<Array>} - массив результатов
   */
  async analyzeBatch(imagePaths) {
    try {
      logger.log(`Batch analyzing ${imagePaths.length} images`);

      const promises = imagePaths.map(path => this.analyzeEmotion(path));
      const results = await Promise.all(promises);

      return results;

    } catch (error) {
      logger.error(`Batch analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Проверка доступности ML-сервиса
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/health`, {
        timeout: 5000
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error(`ML Service is not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Получение информации о модели
   * @returns {Promise<Object>}
   */
  async getModelInfo() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/api/model/info`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get model info: ${error.message}`);
      return null;
    }
  }
}

export default new MLService();