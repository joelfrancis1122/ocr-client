import axios from "axios";

export async function runOcr(frontImage: File, backImage: File) {
  const formData = new FormData();
  formData.append("front", frontImage);
  formData.append("back", backImage);

  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const res = await axios.post(`${apiUrl}/api/ocr`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", 
      },
    });

    return res.data.data  ; 
  } catch (error: any) {
    console.error("OCR request failed:", error.response || error.message);
    throw new Error("Failed to run OCR");
  }
}
