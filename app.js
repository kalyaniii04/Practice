const form = document.getElementById("prompt_form");
const imagesContainer = document.getElementById("images_container");

const API_URL = "http://localhost:3000/generate-image";

let isGenerating = false;

function showLoading(count) {
  imagesContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const box = document.createElement("div");
    box.className = "img_box loading";
    box.textContent = "Loading...";
    imagesContainer.appendChild(box);
  }
}

function updateImages(images) {
  imagesContainer.innerHTML = "";
  images.forEach((imageData, index) => {
    const box = document.createElement("div");
    box.className = "img_box";

    const img = document.createElement("img");
    const link = document.createElement("a");

    const src = URL.createObjectURL(
      new Blob([imageData], { type: "image/png" })
    );

    img.src = src;
    link.href = src;
    link.download = `ai_image_${Date.now()}_${index}.png`;
    link.textContent = "Download";

    box.appendChild(img);
    box.appendChild(link);
    imagesContainer.appendChild(box);
  });
}

async function generateImages(prompt) {
  try {
    showLoading(1);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 28,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const blob = await res.blob();
    updateImages([await blob.arrayBuffer()]);
  } catch (err) {
    console.error(err);
    alert(err.message);
    imagesContainer.innerHTML = "";
  } finally {
    isGenerating = false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isGenerating) return;
  isGenerating = true;

  const prompt = document.getElementById("prompt_input").value.trim();
  if (!prompt) {
    alert("Please enter a prompt");
    isGenerating = false;
    return;
  }

  generateImages(prompt);
});
