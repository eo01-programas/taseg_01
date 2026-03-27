// Integración con Google Apps Script (Sheets) + Utilidades UI

// Buscar reporte
async function buscarReporte() {
    const numReporte = document.getElementById('inputBuscarReporte').value.trim();
    if (!numReporte) {
        setSearchStatus('Ingrese un Nº de Reporte para buscar.');
        return;
    }

    setSearchStatus('Buscando en servidor...', '#0056b3');

    try {
        const data = await getFromScript({ action: 'getReporte', numReporte: numReporte });
        if (data.success && data.data) {
            cargarDatosEnFormulario(data.data);
            setSearchStatus('Reporte cargado correctamente.', '#28a745');
        } else {
            setSearchStatus('Error: ' + (data.error || 'Reporte no encontrado'));
        }
    } catch (err) {
        setSearchStatus('Error de conexion: ' + err.message);
    }
}

// Estado de busqueda
function setSearchStatus(msg, color) {
    const el = document.getElementById('searchStatus');
    el.textContent = msg;
    el.style.color = color || '#dc3545';
    el.style.display = msg ? 'block' : 'none';
}

// Cargar datos en el formulario
function cargarDatosEnFormulario(r) {
    setVal('hdrClientName', r.cliente || '');
    setVal('hdrInspNum', r.numReporte || '');
    setVal('hdrReportDate', r.fechaReporte || '');

    const modA = document.getElementById('moduleA');
    const aInputs = modA ? modA.querySelectorAll('input') : [];
    if (aInputs[11]) aInputs[11].value = r.po || '';
    if (aInputs[12]) aInputs[12].value = r.colorName || '';

    const resGlobal = document.getElementById('resGlobal');
    if (resGlobal) {
        const resultVal = (r.result || '').toUpperCase();
        for (let i = 0; i < resGlobal.options.length; i++) {
            if (resGlobal.options[i].value === resultVal) {
                resGlobal.selectedIndex = i;
                break;
            }
        }
        if (typeof checkPending === 'function') checkPending();
    }

    const totalReject = document.getElementById('totalReject');
    if (totalReject) {
        totalReject.value = r.rejectQty || 0;
    }

    if (r.url) {
        mostrarUrlDrive(r.url);
    }
}

// Helper para asignar valor a un input por ID
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// Registrar reporte en Sheets
async function registrarReporteEnSheets(datos) {
    try {
        const data = await callAppsScript({
            action: 'registrarReporte',
            numReporte: datos.numReporte || '',
            fechaReporte: datos.fechaReporte || '',
            cliente: datos.cliente || '',
            po: datos.po || '',
            colorName: datos.colorName || '',
            result: datos.result || '',
            rejectQty: datos.rejectQty || 0,
            url: datos.url || '',
        });

        if (data.success) {
            console.log('Reporte guardado en Sheets (' + data.modo + ')');
            return data;
        } else {
            console.warn('Error guardando en Sheets:', data.error);
            throw new Error(data.error || 'Error al guardar reporte');
        }
    } catch (err) {
        console.warn('Error de red al guardar en Sheets:', err.message);
        throw err;
    }
}

// Limpiar formulario
function limpiarFormulario() {
    setVal('inputBuscarReporte', '');
    setVal('hdrClientName', 'Dish Duer');
    setVal('hdrInspNum', '');
    setVal('hdrReportDate', '');
    setSearchStatus('');

    const linkDiv = document.getElementById('drivePdfLink');
    if (linkDiv) linkDiv.remove();
}

// Nuevo reporte: limpiar todo y volver al módulo A
function nuevoReporte() {
    limpiarFormulario();

    // Limpiar todos los inputs, selects y textareas del formulario
    document.querySelectorAll('.app-module input:not([readonly])').forEach(el => { el.value = ''; });
    document.querySelectorAll('.app-module textarea').forEach(el => { el.value = ''; });
    document.querySelectorAll('.app-module select').forEach(el => { el.selectedIndex = 0; });

    // Resetear campos numéricos
    ['workmanship', 'measurements', 'onsite', 'totalReject'].forEach(id => setVal(id, '0'));

    // Limpiar fotos capturadas
    if (typeof capturedPhotos !== 'undefined') capturedPhotos.length = 0;
    const gallery = document.getElementById('photo-gallery');
    if (gallery) gallery.innerHTML = '';

    // Ocultar panel de resumen y botón de nuevo reporte
    const panel = document.getElementById('finalSummaryPanel');
    if (panel) panel.classList.add('hidden');
    const btnNuevo = document.getElementById('btn-nuevo-reporte');
    if (btnNuevo) btnNuevo.classList.add('hidden');

    // Resetear resultados de módulos
    const verdictBox = document.getElementById('verdictBox');
    if (verdictBox) { verdictBox.className = 'verdict-box verdict-default'; verdictBox.textContent = 'ESPERANDO DATOS...'; }
    const resultBoxF = document.getElementById('resultBoxF');
    if (resultBoxF) { resultBoxF.className = 'verdict-box verdict-default'; resultBoxF.textContent = 'ESPERANDO SELECCIÓN...'; }
    ['res1','res2','res3','res4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.className = 'verdict-box verdict-default'; el.textContent = 'RESULT: PENDING'; }
    });
    const resultsArea = document.getElementById('results-area');
    if (resultsArea) resultsArea.classList.add('hidden');

    // Navegar al módulo A
    goToModule('moduleA');
    mostrarToast('Formulario limpio. Listo para nuevo reporte.');
}

// Cache de reportes en memoria
let __reportesCache = [];

// Modal para mostrar reportes
async function mostrarModalReportes(forzarCarga = false) {
    const modal = document.getElementById('modalReportes');
    const status = document.getElementById('modalReportesStatus');
    const tableBody = document.getElementById('modalReportesTableBody');
    const filtro = document.getElementById('modalReporteFiltro');

    modal.classList.remove('hidden');

    // 1. Mostrar cache si existe (carga instantánea)
    if (__reportesCache.length > 0 && !forzarCarga) {
        status.textContent = 'Mostrando ' + __reportesCache.length + ' registros guardados. Actualizando en segundo plano...';
        renderizarTablaReportes(__reportesCache);
    } else {
        status.textContent = 'Cargando datos...';
        tableBody.innerHTML = '';
    }

    // 2. Cargar datos frescos del servidor (via GET)
    try {
        const data = await getFromScript({ action: 'getReportes' });

        if (data.success && Array.isArray(data.data)) {
            __reportesCache = data.data;
            status.textContent = 'Registros: ' + __reportesCache.length + '. Use el filtro debajo para busqueda.';
            renderizarTablaReportes(__reportesCache);
        } else {
            status.textContent = 'Error cargando reportes: ' + (data.error || 'sin datos');
        }
    } catch (err) {
        if (__reportesCache.length === 0) {
            status.textContent = 'Error de red: ' + err.message;
        }
    }

    filtro.value = '';
    filtro.oninput = function () {
        const term = this.value.trim().toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(r => {
            const text = r.textContent.toLowerCase();
            r.style.display = term ? (text.includes(term) ? '' : 'none') : '';
        });
    };
}

// Helper para dibujar la tabla
function renderizarTablaReportes(datos) {
    const tableBody = document.getElementById('modalReportesTableBody');
    tableBody.innerHTML = '';
    datos.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.numReporte || ''}</td>
            <td>${item.fechaReporte || ''}</td>
            <td>${item.cliente || ''}</td>
            <td>${item.po || ''}</td>
            <td>${item.colorName || ''}</td>
            <td>${item.result || ''}</td>
            <td>${(item.rejectQty !== undefined && item.rejectQty !== null) ? item.rejectQty : ''}</td>
            <td>${item.url ? '<a href="' + item.url + '" target="_blank" rel="noopener">Abrir PDF</a>' : '---'}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function cerrarModalReportes() {
    document.getElementById('modalReportes').classList.add('hidden');
}

// Toast notifications
function mostrarToast(message, isError) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 16px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
        toast.style.zIndex = '10001';
        toast.style.color = '#fff';
        toast.style.fontSize = '0.9rem';
        toast.style.maxWidth = '90%';
        toast.style.textAlign = 'center';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? '#dc3545' : '#28a745';
    toast.style.display = 'block';
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Modal de confirmacion
function mostrarModalConfirmacion(message, isError) {
    let modal = document.getElementById('uploadConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'uploadConfirmModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.65)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10002';

        const card = document.createElement('div');
        card.style.background = '#fff';
        card.style.padding = '18px 24px';
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
        card.style.minWidth = '300px';
        card.style.textAlign = 'center';
        card.id = 'uploadConfirmCard';

        const text = document.createElement('p');
        text.id = 'uploadConfirmText';
        text.style.fontSize = '1rem';
        text.style.margin = '0';
        text.style.color = isError ? '#dc3545' : '#007a1a';

        card.appendChild(text);
        modal.appendChild(card);
        document.body.appendChild(modal);
    }
    const text = document.getElementById('uploadConfirmText');
    text.textContent = message;
    text.style.color = isError ? '#dc3545' : '#007a1a';
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 2500);
}

// Event listeners globales
document.addEventListener('DOMContentLoaded', function () {
    const inputBuscar = document.getElementById('inputBuscarReporte');
    if (inputBuscar) {
        inputBuscar.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') buscarReporte();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.code === 'F11' || e.key === 'F10') {
            e.preventDefault();
            mostrarModalReportes();
        }
    });

    // Pre-cargar datos en segundo plano al iniciar
    setTimeout(() => {
        getFromScript({ action: 'getReportes' }).then(data => {
            if (data.success && Array.isArray(data.data)) {
                __reportesCache = data.data;
            }
        }).catch(() => {});
    }, 1000);
});
