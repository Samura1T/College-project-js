import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import Logger from '../utils/logger.js';

const logger = new Logger();

class VideoService {
  constructor() {
    this.framesDir = path.join(process.cwd(), 'uploads', 'frames');
    this.videosDir = path.join(process.cwd(), 'uploads', 'videos');
    this.frameRate = 1; // 1 кадр в секунду
  }

  /**
   * Извлечение кадров из видео
   * @param {string} videoPath - путь к видео файлу
   * @param {Object} options - опции извлечения
   * @returns {Promise<Array<string>>} - массив путей к кадрам
   */
  async extractFrames(videoPath, options = {}) {
    try {
      const {
        frameRate = this.frameRate,
        maxFrames = 100,
        startTime = 0
      } = options;

      logger.log(`Extracting frames from video: ${videoPath}`);

      // Создаём директорию для кадров
      const videoName = path.basename(videoPath, path.extname(videoPath));
      const outputDir = path.join(this.framesDir, `${videoName}_${Date.now()}`);
      await fs.mkdir(outputDir, { recursive: true });

      const frames = [];

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .on('end', () => {
            logger.log(`Frames extracted successfully: ${frames.length} frames`);
            resolve(frames);
          })
          .on('error', (err) => {
            logger.error(`Frame extraction error: ${err.message}`);
            reject(err);
          })
          .on('filenames', (filenames) => {
            frames.push(...filenames.map(f => path.join(outputDir, f)));
          })
          .screenshots({
            count: maxFrames,
            folder: outputDir,
            filename: 'frame_%i.jpg',
            size: '640x480'
          });
      });

    } catch (error) {
      logger.error(`Video processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Извлечение одного кадра из видео
   * @param {string} videoPath - путь к видео
   * @param {number} timestamp - временная метка в секундах
   * @returns {Promise<string>} - путь к кадру
   */
  async extractSingleFrame(videoPath, timestamp = 0) {
    try {
      const outputPath = path.join(
        this.framesDir,
        `frame_${Date.now()}.jpg`
      );

      await fs.mkdir(this.framesDir, { recursive: true });

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(timestamp)
          .frames(1)
          .output(outputPath)
          .on('end', () => {
            logger.log(`Frame extracted at ${timestamp}s: ${outputPath}`);
            resolve(outputPath);
          })
          .on('error', reject)
          .run();
      });

    } catch (error) {
      logger.error(`Single frame extraction error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получение метаданных видео
   * @param {string} videoPath - путь к видео
   * @returns {Promise<Object>} - метаданные
   */
  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          logger.error(`Failed to get video metadata: ${err.message}`);
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            width: metadata.streams[0].width,
            height: metadata.streams[0].height,
            fps: eval(metadata.streams[0].r_frame_rate)
          });
        }
      });
    });
  }

  /**
   * Очистка старых кадров
   * @param {number} maxAge - максимальный возраст в миллисекундах
   */
  async cleanupOldFrames(maxAge = 24 * 60 * 60 * 1000) {
    try {
      const files = await fs.readdir(this.framesDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.framesDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          logger.log(`Deleted old frame: ${file}`);
        }
      }

    } catch (error) {
      logger.error(`Cleanup error: ${error.message}`);
    }
  }

  /**
   * Сохранение видео файла
   * @param {Buffer} buffer - буфер видео
   * @param {string} filename - имя файла
   * @returns {Promise<string>} - путь к сохранённому файлу
   */
  async saveVideo(buffer, filename) {
    try {
      await fs.mkdir(this.videosDir, { recursive: true });
      
      const filePath = path.join(this.videosDir, filename);
      await fs.writeFile(filePath, buffer);
      
      logger.log(`Video saved: ${filePath}`);
      return filePath;

    } catch (error) {
      logger.error(`Video save error: ${error.message}`);
      throw error;
    }
  }
}

export default new VideoService();