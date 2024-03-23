import axios from "axios";
import fs from "fs";
import OpenAI from "openai";
import { Memories } from "../models/memories.js";

const configWT = {
  headers: {
    Authorization: `Bearer ${process.env.CLOUD_API_ACCESS_TOKEN}`,
  },
};

const configWhisper = {
  headers: {
    Authorization: `Bearer ${process.env.WHISPER_API}`,
    ContentType: "multipart/form-data",
  },
};

export const handle_audio = async (id) => {
  const res = await axios.get(
    `https://graph.facebook.com/v19.0/${id}/`,
    configWT,
  );

  // const audio = await axios.get(res.data.url, configWT);
  // const media = audio.data;
  //
  // await fs.writeFileSync("audio.ogg", media);

  const audioPath = "audio.mp3";

  console.log("Downloading audio");
  axios
    .get(res.data.url, {
      ...configWT,
      responseType: "stream",
    })
    .then(function (response) {
      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    })
    .catch(function (error) {
      console.error(error);
    });

  const apikey = process.env.OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apikey });

  const translation = await openai.audio.translations.create({
    model: "whisper-1",
    file: fs.createReadStream(audioPath),
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
  });

  // await Memories.create({ memory: translation.text });
  return translation.text;
};
