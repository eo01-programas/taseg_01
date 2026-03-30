// Lógica del Módulo H - Cámara y Fotografías
let currentStream = null;
const capturedPhotos = [];

async function openCamera() {
    const video = document.getElementById('video-preview');
    const btnOpen = document.getElementById('btn-open-camera');
    const btnTake = document.getElementById('btn-take-photo');

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = currentStream;
        video.style.display = 'block';

        btnOpen.classList.add('hidden');
        btnTake.classList.remove('hidden');
    } catch (err) {
        console.error("Error accediendo a la cámara: ", err);
        alert("No se pudo acceder a la cámara. Revisa los permisos e inténtalo de nuevo.");
    }
}

function takePhoto() {
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas-preview');
    const btnTake = document.getElementById('btn-take-photo');
    const btnRetake = document.getElementById('btn-retake-photo');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (currentStream) currentStream.getTracks().forEach(t => t.stop());

    video.style.display = 'none';
    canvas.style.display = 'block';
    btnTake.classList.add('hidden');
    btnRetake.classList.remove('hidden');

    // Guardar foto en arreglo
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const title = document.getElementById('photoTitle').value.trim() || `Fotografía #${capturedPhotos.length + 1}`;
    capturedPhotos.push({ dataUrl, title });

    // Actualizar galería visual
    renderGallery();

    // Limpiar campo de título para la siguiente foto
    document.getElementById('photoTitle').value = '';
    document.getElementById('btn-open-camera').classList.remove('hidden');
    btnRetake.classList.add('hidden');
    canvas.style.display = 'none';
}

function renderGallery() {
    const gallery = document.getElementById('photo-gallery');
    gallery.innerHTML = '';

    capturedPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'border:1px solid #ccd0d5;border-radius:8px;padding:8px;margin-bottom:10px;background:#f9f9f9;';

        item.innerHTML = `
            <img src="${photo.dataUrl}" style="width:100%;border-radius:6px;margin-bottom:5px;">
            <div style="font-size:0.8rem;font-weight:bold;color:#0056b3;margin-bottom:8px;word-break:break-word;">${photo.title}</div>
            <button id="delbtn-${index}" onclick="deletePhoto(${index})" class="btn-delete-photo" style="width:100%;">BORRAR</button>
        `;
        gallery.appendChild(item);
    });
}

let confirmDeleteTimeout = null;

function deletePhoto(index) {
    const btn = document.getElementById('delbtn-' + index);
    if (!btn) return;

    if (btn.dataset.confirm === '1') {
        clearTimeout(confirmDeleteTimeout);
        capturedPhotos.splice(index, 1);
        renderGallery();
        return;
    }

    btn.dataset.confirm = '1';
    btn.textContent = '¿CONFIRMAR?';
    btn.style.backgroundColor = '#8B0000';

    confirmDeleteTimeout = setTimeout(() => {
        if (btn && btn.parentNode) {
            btn.dataset.confirm = '0';
            btn.textContent = 'BORRAR';
            btn.style.backgroundColor = '';
        }
    }, 3000);
}

function retakePhoto() {
    const canvas = document.getElementById('canvas-preview');
    const btnRetake = document.getElementById('btn-retake-photo');
    canvas.style.display = 'none';
    btnRetake.classList.add('hidden');
    openCamera();
}

function handleGalleryFiles(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const title = document.getElementById('photoTitle').value.trim() || `Fotografía #${capturedPhotos.length + 1}`;
            capturedPhotos.push({ dataUrl, title });
            renderGallery();
            document.getElementById('photoTitle').value = '';
        };
        reader.readAsDataURL(file);
    });

    input.value = '';
}
