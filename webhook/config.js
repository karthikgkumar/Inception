import WhatsappCloudAPI from "whatsappcloudapi_wrapper";
import ImageKit from "imagekit";
import { createClient } from "@supabase/supabase-js";

import dotenv from "dotenv";

import mongoose from "mongoose";

dotenv.config();

const options = {
  db: {
    schema: "public",
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: true,
  },
};

export async function connectDBMongo(uri) {
  try {
    await mongoose.connect(uri, { retryWrites: true });
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PRIVATE,
  options,
);

const wt = new WhatsappCloudAPI({
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
  senderPhoneNumberId: process.env.WA_PHONE_NUMBER_ID,
  WABA_ID: process.env.BUSINESS_ID,
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_KEY_PUBLIC,
  privateKey: process.env.IMAGEKIT_KEY_PRIVATE,
  urlEndpoint: process.env.IMAGEKIT_URL,
});

export { wt, imagekit, supabase };
