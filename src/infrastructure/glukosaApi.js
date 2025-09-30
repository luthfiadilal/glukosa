export async function predictGlukosaAPI(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch("https://4c29dc9ffc7d.ngrok-free.app/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Gagal mendapatkan prediksi");

  const data = await response.json();
  return data;
}
