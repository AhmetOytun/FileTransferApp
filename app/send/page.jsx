"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function sendFilePage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [port, setPort] = useState(null);
  const [ip, setIp] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Upload");
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setIsFileSelected(true);
  };

  const handleIpChange = (e) => {
    setIp(e.target.value);
  };

  const handlePortChange = (e) => {
    setPort(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("Uploading...");
    const chunkSize = 1024 * 1024 * 5; // 5 MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunkProgress = 100 / totalChunks;
    let chunkNumber = 0;
    let start = 0;
    let end = Math.min(chunkSize, file.size);

    const uploadChunk = async () => {
      if (chunkNumber < totalChunks) {
        const chunk = file.slice(start, end);
        const formData = new FormData();

        formData.append("file", chunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("filename", file.name);

        const res = await fetch(`http://${ip}:${port}/api/upload`, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then(() => {
            setUploadProgress(Number((chunkNumber + 1) * chunkProgress));
            chunkNumber++;
            start = end;
            end = Math.min(start + chunkSize, file.size);
            uploadChunk();
          })
          .catch((error) => {
            console.error("Error uploading chunk:", error);
          });
      } else {
        setUploadProgress(100);
        setSuccessMessage("File upload completed");
        setUploadStatus("Uploaded");
        setTimeout(() => {
          setSuccessMessage("");
          setUploadProgress(0);
          setIsFileSelected(false);
          setUploadStatus("Upload");
        }, 3000);
      }
    };
    uploadChunk();
  };

  return (
    <div>
      <button
        className="flex items-center mb-4 font-semibold text-gray-300"
        onClick={() => router.back()}
      >
        ← Back
      </button>
      <form onSubmit={handleSubmit} className="flex flex-col w-[15rem]">
        <label className="bg-blue-500 my-5 text-white text-center rounded-md cursor-pointer text-nowrap overflow-hidden">
          {isFileSelected ? file.name : "Select File"}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            required
          />
        </label>
        <input className="my-5 rounded-md text-center" placeholder="Target IP Address" type="text" onChange={handleIpChange} required />
        <input className="my-5 rounded-md text-center" placeholder="Target Port" type="text" onChange={handlePortChange} required />
        <button className="my-5 font-semibold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent" type="submit">{uploadStatus}</button>
        <div className="flex flex-col justify-center items-center">
          {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
          {successMessage && <p className="text-green-400 font-semibold mt-5">{successMessage}</p>}
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
