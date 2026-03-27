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

    // Guardar foto en galería
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const title = document.getElementById('photoTitle').value.trim() || `Fotografía #${capturedPhotos.length + 1}`;
    capturedPhotos.push({ dataUrl, title });

    // Mostrar miniatura en galería
    const gallery = document.getElementById('photo-gallery');
    const item = document.createElement('div');
    item.style.cssText = 'border:1px solid #ccd0d5;border-radius:8px;padding:8px;margin-bottom:10px;background:#f9f9f9;';
    item.innerHTML = `<img src="${dataUrl}" style="width:100%;border-radius:6px;margin-bottom:5px;"><div style="font-size:0.8rem;font-weight:bold;color:#0056b3;">${title}</div>`;
    gallery.appendChild(item);

    // Limpiar campo de título para la siguiente foto
    document.getElementById('photoTitle').value = '';
    document.getElementById('btn-open-camera').classList.remove('hidden');
    btnRetake.classList.add('hidden');
    canvas.style.display = 'none';
}

function retakePhoto() {
    const canvas = document.getElementById('canvas-preview');
    const btnRetake = document.getElementById('btn-retake-photo');
    canvas.style.display = 'none';
    btnRetake.classList.add('hidden');
    openCamera();
}
