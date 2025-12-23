document.addEventListener("DOMContentLoaded", () => {

  const ZIP_SERVER_URL = "https://album-zip-server.onrender.com/download-zip";

  let photosData = {};
  let selectedImages = new Set();

  /* ===== CARROUSEL ===== */
  let carouselPhotos = [];
  let carouselIndex = 0;

  /* ===== LIGHTBOX ===== */
  let currentImages = [];
  let currentIndex = 0;
  let inAlbum = false;

  const header = document.getElementById("header");
  const yearSelect = document.getElementById("yearSelect");
  const albumSelect = document.getElementById("albumSelect");
  const gallery = document.getElementById("gallery");

  const carousel = document.querySelector(".carousel");
  const carouselImg = document.getElementById("carouselImage");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");

  const actions = document.querySelector(".actions");
  const selectAllBtn = document.getElementById("selectAll");
  const deselectAllBtn = document.getElementById("deselectAll");
  const downloadBtn = document.getElementById("downloadSelection");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.querySelector(".lightbox .close");

  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  /* =====================
     ÉTAT INITIAL
  ===================== */
  actions.style.display = "none";
  lightbox.classList.add("hidden");

  /* =====================
     HEADER → ACCUEIL
  ===================== */
  header.addEventListener("click", () => {
    yearSelect.value = "";
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = true;

    gallery.innerHTML = "";
    selectedImages.clear();

    carousel.style.display = "flex";
    actions.style.display = "none";

    lightbox.classList.add("hidden");
  });

  /* =====================
     JSON
  ===================== */
  fetch("photo-data.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      photosData = data;
      buildCarousel();
    });

  /* =====================
     CARROUSEL (VISUEL)
  ===================== */
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

  carouselImg.onclick = () => {
    currentImages = carouselPhotos;
    currentIndex = carouselIndex;
    inAlbum = false;
    openLightbox();
  };

  /* =====================
     ANNÉES / ALBUMS
  ===================== */
  yearSelect.onchange = () => {
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = false;

    gallery.innerHTML = "";
    selectedImages.clear();

    carousel.style.display = "flex";
    actions.style.display = "none";
  };

  albumSelect.onchange = () => {
    gallery.innerHTML = "";
    selectedImages.clear();

    carousel.style.display = "none";
    actions.style.display = "flex";

    const photos =
      photosData[yearSelect.value]?.[albumSelect.value] || [];

    currentImages = photos;
    inAlbum = true;

    photos.forEach((url, i) => {
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

  /* =====================
     SÉLECTION (MINIATURES)
  ===================== */
  selectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input").forEach(cb => {
      cb.checked = true;
      selectedImages.add(cb.dataset.url);
    });
  };

  deselectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input").forEach(cb => cb.checked = false);
    selectedImages.clear();
  };

  /* =====================
     ZIP
  ===================== */
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

  /* =====================
     LIGHTBOX
  ===================== */
  function openLightbox() {
    lightboxImage.src = currentImages[currentIndex];
    lightbox.classList.remove("hidden");

    // flèches UNIQUEMENT dans un album
    lightboxPrev.style.display = inAlbum ? "block" : "none";
    lightboxNext.style.display = inAlbum ? "block" : "none";
  }

  lightboxPrev.onclick = (e) => {
    e.stopPropagation();
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    lightboxImage.src = currentImages[currentIndex];
  };

  lightboxNext.onclick = (e) => {
    e.stopPropagation();
    currentIndex =
      (currentIndex + 1) % currentImages.length;
    lightboxImage.src = currentImages[currentIndex];
  };

  lightboxClose.onclick = () => {
    lightbox.classList.add("hidden");
  };

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });

});
