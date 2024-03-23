import { wt } from "../config.js";

export const initialize = async (recipientPhone) => {
  await wt.sendSimpleButtons({
    recipientPhone: recipientPhone,
    message: `Welcome to orma!\nI am your memory assistant 😌\n\nWebsite link ✨ - https://t.ly/LyonM \n\nSave a thought to safely store your memories you can access any time 😉\n\nRecall to get a random memory from your past 🌟\n\nWhat would you like to do today? 🌈`,
    listOfButtons: [
      {
        title: "Save a Thought",
        id: "save_a_thought",
      },
      {
        title: "Recall",
        id: "recall",
      },
    ],
  });
};
