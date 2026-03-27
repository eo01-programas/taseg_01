// Lógica de sumas en Módulo C
function calculateRejectTotal() {
    const workmanship = parseInt(document.getElementById('workmanship').value) || 0;
    const measurements = parseInt(document.getElementById('measurements').value) || 0;
    const onsite = parseInt(document.getElementById('onsite').value) || 0;
    document.getElementById('totalReject').value = workmanship + measurements + onsite;
}
