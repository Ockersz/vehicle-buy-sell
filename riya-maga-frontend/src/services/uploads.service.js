import axios from "axios";
import { api } from "./api";

export async function presignOne(file) {
  const res = await api.post("/uploads/presign", {
    file_name: file.name,
    content_type: file.type,
  });
  return res.data; // { upload_url, key, public_url }
}

export async function uploadToPresignedUrl(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
}
