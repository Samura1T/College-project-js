const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv } = require('./config/env');

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Подключение к MongoDB
    await connectDB();
    console.log('✅ Database connected successfully');

    // Запуск сервера
    const server = app.listen(port, () => {
      console.log(`🚀 Server running in ${nodeEnv} mode on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`🎭 Emotion Recognition API ready`);
    });

    // Обработка необработанных отклонений промисов
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('\n👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Запуск сервера
startServer();