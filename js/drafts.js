// Lógica para Guardar y Cargar Borradores en LocalStorage (Auto-Save)

async function saveDraft(manual = false) {
    try {
        const inspNum = document.getElementById('hdrInspNum').value.trim();
        const client = document.getElementById('hdrClientName').value.trim();
        
        const draft = {
            timestamp: new Date().getTime(),
            activeModule: document.querySelector('.app-module.active')?.id || 'moduleA',
            // Información para el mensaje de recuperación
            summary: {
                inspNum: inspNum || 'SIN Nº',
                client: client || 'SIN CLIENTE'
            },
            // Datos básicos (Header)
            header: {
                clientName: client,
                inspNum: inspNum,
                reportDate: document.getElementById('hdrReportDate').value
            },
            // Módulo A
            moduleA: Array.from(document.querySelectorAll('#moduleA input, #moduleA select')).map(el => el.value),
            // Módulo B
            resGlobal: document.getElementById('resGlobal').value,
            pendingReason: document.querySelector('#boxPending textarea')?.value || '',
            moduleBChecks: Array.from(document.querySelectorAll('#moduleB .check-item select')).map(el => el.value),
            // Módulo C
            moduleCInputs: {
                workmanship: document.getElementById('workmanship').value,
                measurements: document.getElementById('measurements').value,
                onsite: document.getElementById('onsite').value,
                totalReject: document.getElementById('totalReject').value,
                remarks: document.querySelector('#moduleC textarea').value
            },
            // Módulo D (Dinámico)
            poData: Array.from(document.querySelectorAll('.po-block')).map(block => {
                return Array.from(block.querySelectorAll('input, textarea')).map(el => el.value);
            }),
            // Módulo E (Dinámico)
            moduleEBase: {
                standard: document.querySelectorAll('#moduleE input')[0].value,
                level: document.querySelectorAll('#moduleE select')[0].value,
                plan: document.querySelectorAll('#moduleE select')[1].value,
                sampleSize: document.querySelectorAll('#moduleE input')[2].value,
                aqlMaj: document.querySelectorAll('#moduleE select')[2].value,
                aqlMin: document.querySelectorAll('#moduleE select')[3].value,
                acceptance: document.getElementById('acceptanceLimit').value
            },
            defects: Array.from(document.querySelectorAll('.defect-block')).map(block => {
                return {
                    po: block.querySelectorAll('input')[0].value,
                    ss: block.querySelectorAll('input')[1].value,
                    type: block.querySelector('select:not(.defect-weight)').value,
                    weight: block.querySelector('.defect-weight').value,
                    qty: block.querySelector('.defect-qty').value
                };
            }),
            // Módulo F
            moduleF: {
                sampleSize: document.querySelectorAll('#moduleF input')[1].value,
                calibration: document.querySelectorAll('#moduleF select')[0].value,
                findings: document.getElementById('findingsF').value
            },
            // Módulo G
            moduleG: Array.from(document.querySelectorAll('#moduleG .test-section')).map(sec => {
                return {
                    sampleSize: sec.querySelectorAll('input')[1].value,
                    equip: sec.querySelectorAll('select')[0].value,
                    calib: sec.querySelectorAll('select')[1].value,
                    findings: sec.querySelectorAll('select')[2].value,
                    comments: sec.querySelector('textarea')?.value || ''
                };
            }),
            // Módulo H (Fotos)
            photos: capturedPhotos,
            finalComments: document.getElementById('finalComments').value
        };

        localStorage.setItem('novo_inspection_draft', JSON.stringify(draft));
        
        if (manual) {
            // MOSTRAR MODAL DE GUARDADO
            mostrarModalBorrador();

            // GUARDAR EN LA NUBE
            const resp = await callAppsScript({
                action: 'guardarBorrador',
                numReporte: inspNum,
                datos: draft
            });

            if (resp && resp.success) {
                exitoModalBorrador();
            } else {
                errorModalBorrador(resp?.error || 'Sin respuesta del servidor');
            }
        } else {
            console.log('Borrador auto-guardado localmente.');
        }
    } catch (err) {
        console.warn("Error al auto-guardar borrador:", err);
    }
}

// Funciones para gestionar el modal reutilizable desde Drafts
function mostrarModalBorrador() {
    const m = document.getElementById('savingModal');
    m.classList.remove('hidden');
    document.getElementById('savingSpinner').classList.remove('hidden');
    document.getElementById('savingCheck').classList.add('hidden');
    document.getElementById('savingSummary').classList.add('hidden');
    document.getElementById('btn-close-saving').classList.add('hidden');
    
    document.getElementById('savingTitle').textContent = 'Guardando Borrador...';
    document.getElementById('savingTitle').style.color = 'var(--primary)';
    document.getElementById('savingText').textContent = 'Sincronizando con Google Sheets para mayor seguridad.';
}

function exitoModalBorrador() {
    document.getElementById('savingSpinner').classList.add('hidden');
    document.getElementById('savingCheck').classList.remove('hidden');
    document.getElementById('savingTitle').textContent = '¡Borrador Listo! 💾';
    document.getElementById('savingTitle').style.color = 'var(--success)';
    document.getElementById('savingText').textContent = 'Tus avances han sido guardados en la nube.';
    document.getElementById('btn-close-saving').classList.remove('hidden');
    
    // Auto-cerrar en 2 segundos
    setTimeout(() => {
        if (!document.getElementById('savingModal').classList.contains('hidden')) {
            closeSavingModal();
        }
    }, 2000);
}

function errorModalBorrador(err) {
    document.getElementById('savingSpinner').classList.add('hidden');
    document.getElementById('savingTitle').textContent = 'Error al Sincronizar';
    document.getElementById('savingTitle').style.color = '#dc3545';
    document.getElementById('savingText').textContent = 'Se guardó en local, pero no en la nube: ' + err;
    document.getElementById('btn-close-saving').classList.remove('hidden');
}

function restoreDraftFromObject(d) {
    try {
        // 1. Restaurar básicos
        document.getElementById('hdrClientName').value = d.header.clientName;
        document.getElementById('hdrInspNum').value = d.header.inspNum;
        document.getElementById('hdrReportDate').value = d.header.reportDate;

        // 2. Restaurar Módulo A
        const aEls = document.querySelectorAll('#moduleA input, #moduleA select');
        if (d.moduleA) d.moduleA.forEach((val, i) => { if (aEls[i]) aEls[i].value = val; });

        // 3. Restaurar Módulo B
        if (d.resGlobal) {
            document.getElementById('resGlobal').value = d.resGlobal;
            if (typeof checkPending === 'function') checkPending();
            const textarea = document.querySelector('#boxPending textarea');
            if (textarea) textarea.value = d.pendingReason;
            const bChecks = document.querySelectorAll('#moduleB .check-item select');
            if (d.moduleBChecks) d.moduleBChecks.forEach((val, i) => { if (bChecks[i]) bChecks[i].value = val; });
        }

        // 4. Restaurar Módulo C
        if (d.moduleCInputs) {
            document.getElementById('workmanship').value = d.moduleCInputs.workmanship;
            document.getElementById('measurements').value = d.moduleCInputs.measurements;
            document.getElementById('onsite').value = d.moduleCInputs.onsite;
            document.getElementById('totalReject').value = d.moduleCInputs.totalReject;
            document.querySelector('#moduleC textarea').value = d.moduleCInputs.remarks;
        }

        // 5. Restaurar Módulo D (P.O.s dinámicas)
        const poContainer = document.getElementById('po-container');
        if (poContainer && d.poData && d.poData.length > 0) {
            poContainer.innerHTML = '';
            poCounter = 0;
            d.poData.forEach((poRow, idx) => {
                addNextPO();
                const blocks = document.querySelectorAll('.po-block');
                const inputs = blocks[idx].querySelectorAll('input, textarea');
                poRow.forEach((val, ii) => { if (inputs[ii]) inputs[ii].value = val; });
            });
        }

        // 6. Restaurar Módulo E (Defectos dinámicos)
        if (d.moduleEBase) {
            const eBase = d.moduleEBase;
            const eInputs = document.querySelectorAll('#moduleE input');
            const eSelects = document.querySelectorAll('#moduleE select');
            if (eInputs[0]) eInputs[0].value = eBase.standard;
            if (eSelects[0]) eSelects[0].value = eBase.level;
            if (eSelects[1]) eSelects[1].value = eBase.plan;
            if (eInputs[2]) eInputs[2].value = eBase.sampleSize;
            if (eSelects[2]) eSelects[2].value = eBase.aqlMaj;
            if (eSelects[3]) eSelects[3].value = eBase.aqlMin;
            document.getElementById('acceptanceLimit').value = eBase.acceptance;
        }

        const defContainer = document.getElementById('defects-container');
        if (defContainer && d.defects && d.defects.length > 0) {
            defContainer.innerHTML = '';
            defectCounter = 0;
            d.defects.forEach((def, idx) => {
                addNextDefect();
                const blocks = document.querySelectorAll('.defect-block');
                const b = blocks[idx];
                b.querySelectorAll('input')[0].value = def.po;
                b.querySelectorAll('input')[1].value = def.ss;
                b.querySelector('select:not(.defect-weight)').value = def.type;
                b.querySelector('.defect-weight').value = def.weight;
                b.querySelector('.defect-qty').value = def.qty;
            });
            if (typeof finalizeDefects === 'function') finalizeDefects();
        }

        // 7. Restaurar Módulo F
        if (d.moduleF) {
            const fInputs = document.querySelectorAll('#moduleF input');
            const fSelects = document.querySelectorAll('#moduleF select');
            if (fInputs[1]) fInputs[1].value = d.moduleF.sampleSize;
            if (fSelects[0]) fSelects[0].value = d.moduleF.calibration;
            document.getElementById('findingsF').value = d.moduleF.findings;
            if (typeof calculateResultF === 'function') calculateResultF();
        }

        // 8. Restaurar Módulo G
        if (d.moduleG) {
            const gSections = document.querySelectorAll('#moduleG .test-section');
            d.moduleG.forEach((gData, i) => {
                const sec = gSections[i];
                if (sec) {
                    sec.querySelectorAll('input')[1].value = gData.sampleSize;
                    sec.querySelectorAll('select')[0].value = gData.equip;
                    sec.querySelectorAll('select')[1].value = gData.calib;
                    sec.querySelectorAll('select')[2].value = gData.findings;
                    if (sec.querySelector('textarea')) sec.querySelector('textarea').value = gData.comments;
                    if (typeof updateResult === 'function') updateResult(sec.querySelectorAll('select')[2], `res${i+1}`);
                }
            });
        }

        // 9. Restaurar Fotos
        if (typeof capturedPhotos !== 'undefined') {
            capturedPhotos.length = 0;
            if (d.photos) d.photos.forEach(p => capturedPhotos.push(p));
            if (typeof renderGallery === 'function') renderGallery();
        }
        document.getElementById('finalComments').value = d.finalComments || '';

        // Navegar
        if (typeof goToModule === 'function') goToModule(d.activeModule || 'moduleA');
        mostrarToast('¡Progreso recuperado! 🔍');
    } catch(err) {
        console.error("Error al restaurar objeto:", err);
    }
}

function loadDraft(silencioso = false) {
    const raw = localStorage.getItem('novo_inspection_draft');
    if (!raw) return;

    try {
        const d = JSON.parse(raw);
        const reportInfo = d.summary ? `${d.summary.client} (Nº ${d.summary.inspNum})` : "la sesión anterior";

        if (!silencioso && !confirm(`¿Deseas recuperar el borrador de ${reportInfo}?`)) {
            return;
        }

        restoreDraftFromObject(d);
    } catch (err) {
        console.error("Error al cargar borrador:", err);
    }
}

// Inicialización de auto-guardado
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar cambios en cualquier input del body para auto-guardado silencioso
    document.body.addEventListener('input', (e) => {
        if (e.target.closest('.app-module') || e.target.closest('header')) {
            saveDraft(false); // Guardado silencioso automático
        }
    });

    // Recuperación automática al inicio desactivada por solicitud del usuario
});
