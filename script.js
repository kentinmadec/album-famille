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

  /* JSON */
  fetch("photo-data.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {
      photosData = data;
      buildCarousel();
    });

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

  yearSelect.onchange = () => {
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = false;
    gallery.innerHTML = "";

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
      cb.onchange = () => cb.checked ? selectedImages.add(url) : selectedImages.delete(url);

      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.onclick = () => openLightbox(i);

      div.append(cb, img);
      gallery.appendChild(div);
    });
  };

  function openLightbox(i){
    currentIndex = i;
    lightboxImage.src = currentImages[i];
    lightboxCheckbox.checked = selectedImages.has(currentImages[i]);
    lightbox.classList.remove("hidden");
  }

  lightboxCheckbox.onchange = () => {
    const url = currentImages[currentIndex];
    lightboxCheckbox.checked ? selectedImages.add(url) : selectedImages.delete(url);
  };

  downloadBtn.onclick = async () => {
    if (!selectedImages.size) return alert("Aucune photo sélectionnée");
    const r = await fetch(ZIP_SERVER_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ images:[...selectedImages] })
    });
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photos-famille.zip";
    a.click();
  };

});
