document.addEventListener("DOMContentLoaded", () => {

  const ZIP_SERVER_URL = "https://album-zip-server.onrender.com/download-zip";

  let photosData = {};
  let currentImages = [];
  let currentIndex = 0;
  let selectedImages = new Set();

  let latestPhotos = [];
  let carouselIndex = 0;

  const yearSelect = document.getElementById("yearSelect");
  const albumSelect = document.getElementById("albumSelect");
  const gallery = document.getElementById("gallery");
  const header = document.getElementById("header");

  const selectAllBtn = document.getElementById("selectAll");
  const downloadBtn = document.getElementById("downloadSelection");

  const carousel = document.getElementById("homeCarousel");
  const carouselImg = document.getElementById("carouselImage");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCheckbox = document.getElementById("lightboxCheckbox");

  /* ===================== */
  /* CHARGEMENT JSON */
  /* ===================== */

  fetch("photo-data.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {
      photosData = data;
      buildCarousel();
    });

  /* ===================== */
  /* CARROUSEL (3 PHOTOS) */
  /* ===================== */

  function buildCarousel() {
    latestPhotos = [];
    Object.keys(photosData).sort((a,b)=>b-a).forEach(year => {
      Object.values(photosData[year]).forEach(album => {
        album.forEach(url => latestPhotos.push(url));
      });
    });
    latestPhotos = latestPhotos.slice(0,3);
    if (latestPhotos.length) carouselImg.src = latestPhotos[0];
  }

  /* ===================== */
  /* NAVIGATION */
  /* ===================== */

  header.onclick = () => location.reload();

  yearSelect.onchange = () => {
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = false;
    gallery.innerHTML = "";
    selectedImages.clear();

    Object.keys(photosData[yearSelect.value] || {}).forEach(album => {
      const o = document.createElement("option");
      o.value = album;
      o.textContent = album;
      albumSelect.appendChild(o);
    });
  };

  albumSelect.onchange = () => {
    gallery.innerHTML = "";
    currentImages = [];
    selectedImages.clear();

    const photos = photosData[yearSelect.value]?.[albumSelect.value] || [];

    photos.forEach((url, i) => {
      currentImages.push(url);

      const div = document.createElement("div");
      div.className = "photo";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.url = url;

      cb.onchange = () => {
        cb.checked ? selectedImages.add(url) : selectedImages.delete(url);
      };

      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.onclick = () => openLightbox(i);

      div.append(cb, img);
      gallery.appendChild(div);
    });
  };

  /* ===================== */
  /* BOUTON TOUT SÉLECTIONNER */
  /* ===================== */

  selectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input[type='checkbox']").forEach(cb => {
      cb.checked = true;
      selectedImages.add(cb.dataset.url);
    });
  };

  /* ===================== */
  /* TÉLÉCHARGEMENT ZIP */
  /* ===================== */

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

    if (!response.ok) {
      alert("Erreur lors de la création du ZIP");
      return;
    }

    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photos-famille.zip";
    a.click();
  };

  /* ===================== */
  /* LIGHTBOX */
  /* ===================== */

  function openLightbox(i){
    currentIndex = i;
    lightboxImage.src = currentImages[i];
    lightboxCheckbox.checked = selectedImages.has(currentImages[i]);
    lightbox.classList.remove("hidden");
  }

  lightboxCheckbox.onchange = () => {
    const url = currentImages[currentIndex];
    lightboxCheckbox.checked
      ? selectedImages.add(url)
      : selectedImages.delete(url);
  };

});
