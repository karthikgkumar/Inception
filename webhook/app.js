import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { webhook_post, webhook_get } from "./controllers/webhook.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { connectDBMongo } from "./config.js";

import "express-async-errors";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["*"],
  }),
);

app.get("/webhook", webhook_get);
app.post("/webhook", webhook_post);

app.get("/", (req, res) => {
  res.send("Neeyetha");
});

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
  await connectDBMongo(process.env.MONGO_URI);
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
