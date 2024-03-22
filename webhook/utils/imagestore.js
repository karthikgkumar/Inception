import axios from "axios";
import fs from "fs";
import { imagekit } from "../config.js";
import { Memories } from "../models/memories.js";

const configWT = {
  headers: {
    Authorization: `Bearer ${process.env.CLOUD_API_ACCESS_TOKEN}`,
  },
};

export const UploadImage = async (id, storeid) => {
  const url = await axios.get(
    `https://graph.facebook.com/v19.0/${id}/`,
    configWT,
  );

  const imagePath = "image.jpg";

  console.log("Downloading image");
  await axios
    .get(url.data.url, {
      ...configWT,
      responseType: "stream",
    })
    .then(function (response) {
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    })
    .catch(function (error) {
      console.error(error);
    });

  // const data = await Memories.create({
  //   memory: caption,
  // });

  // console.log(data);

  fs.readFile(imagePath, function (err, data) {
    if (err) throw err; // Fail if the file can't be read.
    imagekit.upload(
      {
        file: data, //required
        fileName: `${storeid}.jpg`, //required
        folder: "/Orma/",
      },
      function (error, result) {
        if (error) console.log(error);
        else {
          // console.log(result);
        }
      },
    );
  });
};
