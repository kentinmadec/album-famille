let selectedImages = [];
let activeAlbum = null;
let currentImages = [];
let currentIndex = 0;

window.onload = () => buildHome();

function goHome() {
    document.querySelectorAll('.year').forEach(y => y.style.display = 'none');
    document.getElementById('home').style.display = 'block';
}

function showYear(year) {
    goHome();
    document.getElementById('home').style.display = 'none';
    if (year) document.getElementById('year-' + year).style.display = 'block';

    document.querySelectorAll('.photos img').forEach(img => {
        img.onclick = () => toggleSelect(img);
        img.ondblclick = () => openImage(img);
    });
}

function buildHome() {
    const homeGallery = document.getElementById('homeGallery');
    homeGallery.innerHTML = '';

    const allImages = Array.from(document.querySelectorAll('.photos img'));
    const latest = allImages.slice(-12).reverse();

    latest.forEach((img, i) => {
        const clone = img.cloneNode();
        clone.onclick = () => openImageFromHome(latest, i);
        homeGallery.appendChild(clone);
    });
}

function toggleSelect(img) {
    const album = img.closest('.album');

    if (activeAlbum && album !== activeAlbum) {
        clearSelection();
    }

    activeAlbum = album;

    if (selectedImages.includes(img)) {
        selectedImages = selectedImages.filter(i => i !== img);
        img.classList.remove('selected');
    } else {
        selectedImages.push(img);
        img.classList.add('selected');
    }
}

function selectAll(btn) {
    clearSelection();
    activeAlbum = btn.closest('.album');

    activeAlbum.querySelectorAll('.photos img').forEach(img => {
        img.classList.add('selected');
        selectedImages.push(img);
    });
}

function clearSelection() {
    selectedImages.forEach(img => img.classList.remove('selected'));
    selectedImages = [];
    activeAlbum = null;
}

function openImage(img) {
    currentImages = Array.from(img.closest('.photos').querySelectorAll('img'));
    currentIndex = currentImages.indexOf(img);
    openOverlay();
}

function openImageFromHome(images, index) {
    currentImages = images;
    currentIndex = index;
    openOverlay();
}

function openOverlay() {
    document.getElementById('overlayImage').src = currentImages[currentIndex].src;
    document.getElementById('downloadLink').href = currentImages[currentIndex].src;
    document.getElementById('overlay').style.display = 'flex';
}

function closeImage() {
    document.getElementById('overlay').style.display = 'none';
}

function nextImage() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    openOverlay();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    openOverlay();
}

function downloadZip() {
    if (selectedImages.length === 0) {
        alert("Veuillez sélectionner au moins une photo");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("photos-selection");

    Promise.all(
        selectedImages.map(img =>
            fetch(img.src)
                .then(r => r.blob())
                .then(b => folder.file(img.src.split('/').pop(), b))
        )
    ).then(() => {
        zip.generateAsync({ type: "blob" }).then(content => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            a.download = "photos-selection.zip";
            a.click();
        });
    });
}
