import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";
import os from "os";

let percentage = 0;

const desktopPath = path.join(os.homedir(), "Desktop");

const mergeChunks = async (fileName, totalChunks, mergedTime) => {
  const chunkDir = path.join(process.cwd(), "chunks");
  const mergedFilePath = path.join(desktopPath, "uploads");

  const maxRetries = 5;

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath, { recursive: true });
  }

  let startChunk = 0;

  const outputFilePath = `${mergedFilePath}/${mergedTime}-${fileName}`;
  const writeStream = fs.createWriteStream(outputFilePath, { flags: "a" });

  writeStream.on("error", (err) => {
    console.error("Error writing to file:", err);
    writeStream.destroy();
  });

  try {
    for (let i = startChunk; i < totalChunks; i++) {
      const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
      let chunkBuffer;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          chunkBuffer = await fs.promises.readFile(chunkFilePath);
          break;
        } catch (err) {
          console.error(`Error reading chunk ${i} (attempt ${attempt}):`, err);
          if (attempt === maxRetries) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (!writeStream.write(chunkBuffer)) {
            await new Promise((resolve) => writeStream.once("drain", resolve));
          }
          break;
        } catch (err) {
          console.error(`Error writing chunk ${i} (attempt ${attempt}):`, err);
          if (attempt === maxRetries) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      fs.unlinkSync(chunkFilePath);
    }

    writeStream.end();
  } catch (err) {
    console.error("Error during merging:", err);
    writeStream.destroy();
  }
};

export const POST = async (req, res) => {
  const formData = await req.formData();
  const uploadsPath = path.join(desktopPath, "uploads"); // Change this line
  const chunkDir = path.join(process.cwd(), "chunks");
  const chunk = formData.get("file");
  const originalName = formData.get("filename");
  const chunkNumber = Number(formData.get("chunkNumber"));
  const totalChunks = Number(formData.get("totalChunks"));
  const chunkFilePath = `${chunkDir}/${originalName}.part_${chunkNumber}`;

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
  }

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");
  try {
    await writeFile(chunkFilePath, buffer);

    const timeStamp = new Date().getTime();

    percentage = Math.round((chunkNumber / totalChunks) * 100);

    if (chunkNumber === totalChunks - 1) {
      await mergeChunks(originalName, totalChunks, timeStamp);
      percentage = 100;

      setTimeout(() => {
        percentage = 0;
      }, 1000);
    }
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};

export const GET = async (req, res) => {
  return NextResponse.json({ percentage, status: 200 });
};
