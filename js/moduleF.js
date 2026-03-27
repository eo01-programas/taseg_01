// Lógica del Módulo F
function calculateResultF() {
    const findings = document.getElementById('findingsF').value;
    const resultBox = document.getElementById('resultBoxF');

    if (findings === 'Yes') {
        resultBox.innerText = 'FAIL';
        resultBox.className = 'verdict-box verdict-fail';
    } else if (findings === 'No') {
        resultBox.innerText = 'PASS';
        resultBox.className = 'verdict-box verdict-pass';
    } else {
        resultBox.innerText = 'ESPERANDO SELECCIÓN...';
        resultBox.className = 'verdict-box verdict-default';
    }
}
