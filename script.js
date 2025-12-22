document.addEventListener("DOMContentLoaded", () => {

  const ZIP_SERVER_URL = "https://album-zip-server.onrender.com/download-zip";

  let photosData = {};
  let currentImages = [];
  let currentIndex = 0;
  let selectedImages = new Set();

  const yearSelect = document.getElementById("yearSelect");
  const albumSelect = document.getElementById("albumSelect");
  const gallery = document.getElementById("gallery");

  const selectAllBtn = document.getElementById("selectAll");
  const deselectAllBtn = document.getElementById("deselectAll");
  const downloadBtn = document.getElementById("downloadSelection");

  const carousel = document.querySelector(".carousel");
  const carouselImg = document.getElementById("carouselImage");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCheckbox = document.getElementById("lightboxCheckbox");

  /* CHARGEMENT JSON */
  fetch("photo-data.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {
      photosData = data;
      loadCarousel();
    });

  function loadCarousel() {
    const photos = [];
    Object.keys(photosData).sort((a,b)=>b-a).forEach(year=>{
      Object.values(photosData[year]).forEach(album=>{
        album.forEach(url=>photos.push(url));
      });
    });
    if (photos.length) carouselImg.src = photos[0];
  }

  yearSelect.onchange = () => {
    albumSelect.innerHTML = `<option value="">Choisir un album</option>`;
    albumSelect.disabled = false;
    gallery.innerHTML = "";
    selectedImages.clear();
    carousel.style.display = "flex";

    Object.keys(photosData[yearSelect.value] || {}).forEach(album=>{
      const opt = document.createElement("option");
      opt.value = album;
      opt.textContent = album;
      albumSelect.appendChild(opt);
    });
  };

  albumSelect.onchange = () => {
    gallery.innerHTML = "";
    currentImages = [];
    selectedImages.clear();
    carousel.style.display = "none";

    const photos = photosData[yearSelect.value]?.[albumSelect.value] || [];
    photos.forEach((url,i)=>{
      currentImages.push(url);

      const div = document.createElement("div");
      div.className = "photo";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.url = url;
      cb.onchange = ()=>cb.checked ? selectedImages.add(url) : selectedImages.delete(url);

      const img = document.createElement("img");
      img.src = url;
      img.onclick = ()=>openLightbox(i);

      div.append(cb,img);
      gallery.appendChild(div);
    });
  };

  /* TOUT SÉLECTIONNER */
  selectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input").forEach(cb=>{
      cb.checked = true;
      selectedImages.add(cb.dataset.url);
    });
  };

  /* TOUT DÉSÉLECTIONNER */
  deselectAllBtn.onclick = () => {
    document.querySelectorAll(".photo input").forEach(cb=>{
      cb.checked = false;
    });
    selectedImages.clear();
    lightboxCheckbox.checked = false;
  };

  /* ZIP */
  downloadBtn.onclick = async () => {
    if (!selectedImages.size) return alert("Aucune photo sélectionnée");

    const res = await fetch(ZIP_SERVER_URL,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ images:[...selectedImages] })
    });

    if(!res.ok) return alert("Erreur lors de la création du ZIP");

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photos-famille.zip";
    a.click();
  };

  /* LIGHTBOX */
  function openLightbox(i){
    currentIndex = i;
    lightboxImage.src = currentImages[i];
    lightboxCheckbox.checked = selectedImages.has(currentImages[i]);
    lightbox.classList.remove("hidden");
  }

  lightboxCheckbox.onchange = ()=>{
    const url = currentImages[currentIndex];
    lightboxCheckbox.checked ? selectedImages.add(url) : selectedImages.delete(url);
  };

});
