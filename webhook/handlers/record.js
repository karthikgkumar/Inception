import { wt } from "../config.js";

export const record = async (recipientPhone) => {
  await wt.sendText({
    message: "Sure go ahead 🌟",
    recipientPhone: recipientPhone,
  });
};
