import express from "express";
import dotenv from "dotenv";
import router from "./routes/main.js";
import Logger from "./utils/logger.js";

const app = express();
const port = process.env.PORT || 3000;
const logger = new Logger();

app.use(express.json());
app.use(router);

dotenv.config();

app.listen(port, () => {
    logger.log(`Server running on port ${port} `);
});