import { wt } from "../config.js";
import { handle_audio } from "../handlers/handle_audio.js";
import { initialize } from "../handlers/initialize.js";
import { record } from "../handlers/record.js";
import { Memories } from "../models/memories.js";
import { supabase } from "../config.js";
import { UploadImage } from "../utils/imagestore.js";
import { vectorize } from "../utils/vector.js";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

let status = "initial";

let timeoutid = 0;

const reset = () => {
  const id = setTimeout(
    () => {
      status = "initial";
    },
    1000 * 60 * 5,
  );
  return id;
};

const webhook_get = async (req, res) => {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == "patrose"
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
};

const webhook_post = async (req, res) => {
  const body = wt.parseMessage(req.body);

  const apiKey = process.env.OPENAI_KEY;

  const openai = new OpenAI({ apiKey: apiKey });

  if (body?.isMessage) {
    let incomingMessage = body.message;
    let recipientPhone = incomingMessage.from.phone;
    console.log(recipientPhone);
    let recipientName = incomingMessage.from.name;
    let typeOfMsg = incomingMessage.type;
    let message_id = incomingMessage.message_id;

    // console.log(typeOfMsg);

    if (typeOfMsg === "text_message" && status == "initial") {
      await initialize(recipientPhone);
    } else if (typeOfMsg === "simple_button_message") {
      const buttonId = incomingMessage.interactive.button_reply;
      if (timeoutid != 0) clearTimeout(timeoutid);
      if (buttonId.id === "save_a_thought") {
        timeoutid = reset();
        status = "waiting";
        await record(recipientPhone);
      }
      if (buttonId.id === "recall") {
        timeoutid = reset();
        status = "forgot";
        await wt.sendText({
          message: "What do you want to remember?",
          recipientPhone: recipientPhone,
        });
      }
    } else if (typeOfMsg === "text_message" && status == "waiting") {
      // console.log(incomingMessage);

      // await Memories.create({ memory: incomingMessage.text.body });

      const vectorForm = vectorize(incomingMessage.text.body);

      const { error } = await supabase.from("memories").insert({
        memories: incomingMessage.text.body,
        memory_vector: vectorForm,
      });

      console.log(error);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant to people with dementia who shares memories with you for safe keeping.",
          },
          {
            role: "user",
            content: `${incomingMessage.text.body} - Send an appropriate response to this that doesn't initiate a new conversation.`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      await wt.sendText({
        message: completion.choices[0].message.content,
        recipientPhone: recipientPhone,
      });

      clearTimeout(timeoutid);
      status = "initial";
    } else if (
      incomingMessage.audio &&
      incomingMessage.audio.hasOwnProperty("id") &&
      status === "waiting"
    ) {
      const translation = await handle_audio(incomingMessage.audio.id);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant to people with dementia who shares memories with you for safe keeping.",
          },
          {
            role: "user",
            content: `${translation} - Send an appropriate response to this that doesn't initiate a new conversation.`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      await wt.sendText({
        message: completion.choices[0].message.content,
        recipientPhone: recipientPhone,
      });

      const vectorForm = vectorize(translation);

      // await Memories.create({ memory: translation.text });
      const { error } = await supabase.from("memories").insert({
        memories: translation,
        memory_vector: vectorForm,
      });

      clearTimeout(timeoutid);
      status = "initial";
    } else if (
      incomingMessage.image &&
      incomingMessage.image.hasOwnProperty("id") &&
      status === "waiting"
    ) {
      console.log(incomingMessage);

      const vectorForm = vectorize(incomingMessage.image.caption);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant to people with dementia who shares memories with you for safe keeping.",
          },
          {
            role: "user",
            content: `${incomingMessage.image.caption} - Send an appropriate response to this that doesn't initiate a new conversation.`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      await wt.sendText({
        message: completion.choices[0].message.content,
        recipientPhone: recipientPhone,
      });

      const { data, error } = await supabase
        .from("memories")
        .insert({
          memories: incomingMessage.image.caption,
          memory_vector: vectorForm,
        })
        .select();

      await UploadImage(incomingMessage.image.id, data[0].id);
      clearTimeout(timeoutid);
      status = "initial";
    } else if (typeOfMsg === "text_message" && status == "forgot") {
      const vectorForm = vectorize(incomingMessage.text.body);

      // const completion = await openai.chat.completions.create({
      //   messages: [
      //     {
      //       role: "system",
      //       content: "You are a keyword extractor for sentences",
      //     },
      //     {
      //       role: "user",
      //       content: `${incomingMessage.text.body} - Extract keywords from this sentence seperated by a comma.`,
      //     },
      //   ],
      //   model: "gpt-3.5-turbo",
      // });

      // const keywords = completion.choices[0].message.content.split(",");

      const { data, error } = await supabase.from("memories").select();

      let memories = "";

      data.map((memory) => {
        memories += memory.id + "," + memory.memories + "\n";
      });
      console.log(memories);

      const completion2 = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a model which searches for memories based on prompts and returns yes or no",
          },
          {
            role: "user",
            content: `mems - ${memories},prompt - ${incomingMessage.text.body}.`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      if (completion2.choices[0].message.content === "No") {
        await wt.sendText({
          message: "Oh no, I couldn't find any memories related to that",
          recipientPhone: recipientPhone,
        });
        clearTimeout(timeoutid);
        status = "initial";
      } else {
        await wt.sendText({
          message: "Yes you are on the right track",
          recipientPhone: recipientPhone,
        });
        status = "remember";
      }
    } else if (
      incomingMessage.audio &&
      incomingMessage.audio.hasOwnProperty("id") &&
      status === "forgot"
    ) {
      const translation = await handle_audio(incomingMessage.audio.id);

      const { data, error } = await supabase.from("memories").select();

      let memories = "";

      data.map((memory) => {
        memories += memory.memories + ", ";
      });
      console.log(memories);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant to people with dementia who shares memories with you for safe keeping.",
          },
          {
            role: "user",
            content: `${memories} - Considering all these memories,provide an accurate answer for this question without initiating a new conversation ${translation} .`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      await wt.sendText({
        message: completion.choices[0].message.content,
        recipientPhone: recipientPhone,
      });
    } else if (typeOfMsg === "text_message" && status == "remember") {
      const { data, error } = await supabase.from("memories").select();

      let memories = "";

      data.map((memory) => {
        memories += memory.memories + ", ";
      });
      console.log(memories);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant to people with dementia who shares memories with you for safe keeping.",
          },
          {
            role: "user",
            content: `${memories} -Each memory are seperate,Provide an accurate answer with an encouraging tone because the person remembered the event and is recalling it, for this question related to only one of these memories ${incomingMessage.text.body}`,
          },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0,
      });

      await wt.sendText({
        message: completion.choices[0].message.content,
        recipientPhone: recipientPhone,
      });

      clearTimeout(timeoutid);
      status = "initial";
    }
  }

  return res.sendStatus(200);
};

export { webhook_get, webhook_post };
