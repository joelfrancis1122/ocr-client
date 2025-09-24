export async function runOcr(frontImage: File, backImage: File) {
  const formData = new FormData();
  formData.append("front", frontImage);
  formData.append("back", backImage);

  const res = await fetch("http://localhost:3000/api/ocr", {
    method: "POST",
    body: formData,
  });
console.log(res)
  if (!res.ok) {
    throw new Error("Failed to run OCR");
  }

  return await res.json();
}
