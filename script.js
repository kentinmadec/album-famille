document.addEventListener("DOMContentLoaded", () => {

  /* ===================== */
  /* CONFIGURATION */
  /* ===================== */

  const B2_BASE = "https://f003.backblazeb2.com/file";
  const ZIP_SERVER_URL = "https://album-zip-server.onrender.com/download-zip";

  /* ===================== */
  /* ÉTAT GLOBAL */
  /* ===================== */

  let photosData = {};
  let currentImages = [];
  let currentIndex = 0;
  let selectedImages = new Set();

  let latestPhotos = [];
  let carouselIndex = 0;

  /* ===================== */
  /* ÉLÉMENTS DOM */
  /* ===================== */

  const yearSelect = document.getElementById("yearSelect");
  const albumSelect = document.getElementById("albumSelect");
  const gallery = document.getElementById("gallery");
  const header = document.getElementById("header");

  const selectAllBtn = document.getElementById("selectAll");
  const downloadBtn = document.getElementById("downloadSelection");

  const carousel = document.getElementById("homeCarousel");
  const carouselImg = document.getElementById("carouselImage");
  const carouselNext = document.querySelector(".carousel .next");
  const carouselPrev = document.querySelector(".carousel .prev");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCheckbox = document.getElementById("lightboxCheckbox");
  const btnClose = document.querySelector(".lightbox .close");
  const btnPrev = document.querySelector(".lightbox .prev");
  const btnNext = document.querySelector(".lightbox .next");

  /* ===================== */
  /* CHARGEMENT JSON */
  /* ===================== */

  fetch("photo-data.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {
      photosData = data;
      buildLatestPhotos();
      showCarouselImage();
      setInterval(nextCarousel, 5000);
    })
    .catch(err => console.error("Erreur JSON :", err));

  /* ===================== */
  /* CARROUSEL (3 PHOTOS) */
  /* ===================== */

  function buildLatestPhotos() {
    latestPhotos = [];

    Object.keys(photosData)
      .sort((a, b) => b - a)
      .forEach(year => {
        Object.values(photosData[year]).forEach(album => {
          album.forEach(path => {
            latestPhotos.push(`${B2_BASE}/${path}`);
          });
        });
      });

    latestPhotos = latestPhotos.slice(0, 3);
  }

  function showCarouselImage() {
    if (!latestPhotos.length) return;
    carouselImg.src = latestPhotos[carouselIndex];
    carouselImg.onclick = () => openLightboxFromCarousel();
  }

  function nextCarousel() {
    carouselIndex = (carouselIndex + 1) % latestPhotos.length;
    showCarouselImage();
  }

  function prevCarousel() {
    carouselIndex = (carouselIndex - 1 + latestPhotos.length) % latestPhotos.length;
    showCarouselImage();
  }

  carouselNext.onclick = nextCarousel;
  carouselPrev.onclick = prevCarousel;

  function openLightboxFromCarousel() {
    currentImages = [...latestPhotos];
    currentIndex = carouselIndex;
    updateLightbox();
    lightbox.classList.remove("hidden");
  }

  /* ===================== */
  /* NAVIGATION */
  /* ===================== */

  header.onclick = () => location.reload();

  yearSelect.onchange = () => {
    carousel.style.display = "none";
    gallery.innerHTML = "";
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = true;
    selectedImages.clear();

    const year = yearSelect.value;
    if (!photosData[year]) return;

    Object.keys(photosData[year]).forEach(album => {
      const opt = document.createElement("option");
      opt.value = album;
      opt.textContent = album.replace("photos-", "Photos ");
      albumSelect.appendChild(opt);
    });

    albumSelect.disabled = false;
  };

  albumSelect.onchange = () => {
    const year = yearSelect.value;
    const album = albumSelect.value;

    gallery.innerHTML = "";
    currentImages = [];
    selectedImages.clear();

    if (!photosData[year]?.[album]) return;

    photosData[year][album].forEach((path, index) => {
      const url = `${B2_BASE}/${path}`;
      currentImages.push(url);

      const div = document.createElement("div");
      div.className = "photo";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.url = url;
      checkbox.onclick = e => e.stopPropagation();
      checkbox.onchange = () =>
        checkbox.checked ? selectedImages.add(url) : selectedImages.delete(url);

      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.onclick = () => openLightbox(index);

      div.appendChild(checkbox);
      div.appendChild(img);
      gallery.appendChild(div);
    });
  };

  /* ===================== */
  /* ACTIONS */
  /* ===================== */

  selectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input").forEach(cb => {
      cb.checked = true;
      selectedImages.add(cb.dataset.url);
    });
  };

  downloadBtn.onclick = async () => {
    if (!selectedImages.size) {
      alert("Aucune photo sélectionnée");
      return;
    }

    const response = await fetch(ZIP_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: [...selectedImages] })
    });

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "photos-famille.zip";
    link.click();
  };

  /* ===================== */
  /* LIGHTBOX */
  /* ===================== */

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.remove("hidden");
  }

  function updateLightbox() {
    const url = currentImages[currentIndex];
    lightboxImage.src = url;
    lightboxCheckbox.checked = selectedImages.has(url);
  }

  lightboxCheckbox.onchange = () => {
    const url = currentImages[currentIndex];
    lightboxCheckbox.checked
      ? selectedImages.add(url)
      : selectedImages.delete(url);
  };

  btnClose.onclick = () => lightbox.classList.add("hidden");
  btnNext.onclick = () => {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightbox();
  };
  btnPrev.onclick = () => {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightbox();
  };

});
