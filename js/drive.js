// Integración con Google Drive
function setDriveButtonState(isLoading) {
    const btn = document.getElementById('btn-upload-drive');
    if (!btn) return;

    btn.disabled = !!isLoading;
    btn.textContent = isLoading ? 'GUARDANDO...' : 'SUBIR EN DRIVE';
    btn.style.opacity = isLoading ? '0.7' : '1';
    btn.style.cursor = isLoading ? 'wait' : 'pointer';
}

async function guardarPdfEnDriveDesdeApp(numReporte, base64, filename) {
    try {
        const data = await callAppsScript({
            action: 'guardarPdf',
            numReporte: numReporte,
            pdfBase64: base64,
            nombreArchivo: filename
        }, 120000);

        if (data && data.success && data.url) {
            mostrarUrlDrive(data.url);
            return data;
        } else {
            const errMsg = (data && data.error) ? data.error : 'Respuesta no exitosa de la Web App';
            throw new Error(errMsg);
        }
    } catch (err) {
        console.warn('Error al subir PDF a Drive:', err.message || err);
        throw err;
    }
}

function mostrarUrlDrive(url) {
    let linkDiv = document.getElementById('drivePdfLink');
    if (!linkDiv) {
        const panel = document.getElementById('finalSummaryPanel');
        if (!panel) return;
        panel.classList.remove('hidden');
        linkDiv = document.createElement('div');
        linkDiv.id = 'drivePdfLink';
        linkDiv.style.cssText = 'margin-top:12px;padding:10px;background:#e8f0fe;border-radius:8px;text-align:center;font-size:0.85rem;';
        panel.appendChild(linkDiv);
    }
    linkDiv.innerHTML = '📄 <strong>PDF en Drive:</strong> <a href="' + url + '" target="_blank" style="color:#0056b3;word-break:break-all;">' + url + '</a>';
}
