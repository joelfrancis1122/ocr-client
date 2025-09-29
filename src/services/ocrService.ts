export async function runOcr(frontImage: File, backImage: File) {
  const formData = new FormData();
  formData.append("front", frontImage);
  formData.append("back", backImage);

  const apiUrl = import.meta.env.VITE_API_URL; 
  const res = await fetch(`${apiUrl}/api/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to run OCR");
  }

  return await res.json();
}
