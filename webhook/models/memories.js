import mongoose from "mongoose";

const MemorieSchema = new mongoose.Schema({
  memory: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  imgURL: {
    type: String,
    required: false,
  },
});

export const Memories = mongoose.model("Memories", MemorieSchema);
