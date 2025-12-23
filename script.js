document.addEventListener("DOMContentLoaded", () => {

  const ZIP_SERVER_URL = "https://album-zip-server.onrender.com/download-zip";

  let photosData = {};
  let selectedImages = new Set();

  let carouselPhotos = [];
  let carouselIndex = 0;

  let currentImages = [];
  let currentIndex = 0;

  const yearSelect = document.getElementById("yearSelect");
  const albumSelect = document.getElementById("albumSelect");
  const gallery = document.getElementById("gallery");

  const carousel = document.querySelector(".carousel");
  const carouselImg = document.getElementById("carouselImage");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");

  const selectAllBtn = document.getElementById("selectAll");
  const deselectAllBtn = document.getElementById("deselectAll");
  const downloadBtn = document.getElementById("downloadSelection");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCheckbox = document.getElementById("lightboxCheckbox");
  const lightboxClose = document.querySelector(".lightbox .close");

  /* 🔒 SÉCURITÉ : on force la lightbox à être fermée au départ */
  lightbox.classList.add("hidden");

  /* ===================== */
  /* JSON */
  /* ===================== */
  fetch("photo-data.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      photosData = data;
      buildCarousel();
    });

  /* ===================== */
  /* CARROUSEL (3 PHOTOS) */
  /* ===================== */
  function buildCarousel() {
    carouselPhotos = [];

    Object.keys(photosData)
      .sort((a, b) => b - a)
      .forEach(year => {
        Object.values(photosData[year]).forEach(album => {
          album.forEach(url => carouselPhotos.push(url));
        });
      });

    carouselPhotos = carouselPhotos.slice(0, 3);

    if (carouselPhotos.length) {
      carouselIndex = 0;
      carouselImg.src = carouselPhotos[0];
    }
  }

  prevBtn.onclick = () => {
    carouselIndex =
      (carouselIndex - 1 + carouselPhotos.length) % carouselPhotos.length;
    carouselImg.src = carouselPhotos[carouselIndex];
  };

  nextBtn.onclick = () => {
    carouselIndex =
      (carouselIndex + 1) % carouselPhotos.length;
    carouselImg.src = carouselPhotos[carouselIndex];
  };

  /* ✅ PLEIN ÉCRAN UNIQUEMENT AU CLIC */
  carouselImg.onclick = () => {
    currentImages = carouselPhotos;
    currentIndex = carouselIndex;
    openLightbox();
  };

  /* ===================== */
  /* ANNÉES / ALBUMS */
  /* ===================== */
  yearSelect.onchange = () => {
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = false;
    gallery.innerHTML = "";
    selectedImages.clear();
    carousel.style.display = "flex";

    Object.keys(photosData[yearSelect.value] || {}).forEach(album => {
      const opt = document.createElement("option");
      opt.value = album;
      opt.textContent = album;
      albumSelect.appendChild(opt);
    });
  };

  albumSelect.onchange = () => {
    gallery.innerHTML = "";
    selectedImages.clear();
    currentImages = [];
    carousel.style.display = "none";

    const photos =
      photosData[yearSelect.value]?.[albumSelect.value] || [];

    photos.forEach((url, i) => {
      currentImages.push(url);

      const div = document.createElement("div");
      div.className = "photo";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.url = url;
      cb.onchange = () =>
        cb.checked ? selectedImages.add(url) : selectedImages.delete(url);

      const img = document.createElement("img");
      img.src = url;
      img.onclick = () => {
        currentIndex = i;
        openLightbox();
      };

      div.append(cb, img);
      gallery.appendChild(div);
    });
  };

  /* ===================== */
  /* ZIP */
  /* ===================== */
  downloadBtn.onclick = async () => {
    if (!selectedImages.size) {
      alert("Aucune photo sélectionnée");
      return;
    }

    const res = await fetch(ZIP_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: [...selectedImages] })
    });

    if (!res.ok) {
      alert("Erreur lors de la création du ZIP");
      return;
    }

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photos-famille.zip";
    a.click();
  };

  /* ===================== */
  /* LIGHTBOX */
  /* ===================== */
  function openLightbox() {
    lightboxImage.src = currentImages[currentIndex];
    lightboxCheckbox.checked =
      selectedImages.has(currentImages[currentIndex]);
    lightbox.classList.remove("hidden");
  }

  lightboxClose.onclick = () => {
    lightbox.classList.add("hidden");
  };

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });

});
