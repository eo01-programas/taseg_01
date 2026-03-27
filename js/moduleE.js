// Lógica del Módulo E - Defectos y Resultados
let defectCounter = 1;

function addNextDefect() {
    defectCounter++;
    const container = document.getElementById('defects-container');
    const newBlock = document.createElement('div');
    newBlock.className = 'dynamic-block defect-block';

    newBlock.innerHTML = `
        <div class="block-header">Defecto #${defectCounter}</div>
        <div class="header-row">
            <div class="field"><label>P.O. Nº</label><input type="text" placeholder="Alfanumérico"></div>
            <div class="field"><label>Sample Size</label><input type="text" placeholder="Alfanumérico"></div>
        </div>
        <div class="field">
            <label>Type of Defective</label>
            <select>
                <option>Untrimmed threads</option><option>Embellishment</option><option>Hole</option>
                <option>Broken/skip stitch</option><option>Color shading</option><option>Puckering</option>
                <option>Cleaness</option><option>Asymetrical</option><option>Wrong Hangtag</option>
                <option>Assorment</option><option>Shipping Marks</option><option>Measurements</option>
                <option>Foreign contamination</option><option>Others</option>
            </select>
        </div>
        <div class="header-row">
            <div class="field">
                <label>Weight</label>
                <select class="defect-weight">
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                </select>
            </div>
            <div class="field">
                <label>Quantity</label>
                <input type="text" class="defect-qty" placeholder="Alfanumérico">
            </div>
        </div>
    `;
    container.appendChild(newBlock);
}

function finalizeDefects() {
    document.getElementById('results-area').classList.remove('hidden');

    let sumCrit = 0, sumMaj = 0, sumMin = 0;
    const defectBlocks = document.querySelectorAll('.defect-block');

    defectBlocks.forEach(block => {
        const weight = block.querySelector('.defect-weight').value;
        const qtyStr = block.querySelector('.defect-qty').value;
        const qty = parseInt(qtyStr) || 0;

        if (weight === 'Critical') sumCrit += qty;
        else if (weight === 'Major') sumMaj += qty;
        else if (weight === 'Minor') sumMin += qty;
    });

    document.getElementById('resCrit').innerText = sumCrit;
    document.getElementById('resMaj').innerText = sumMaj;
    document.getElementById('resMin').innerText = sumMin;

    const total = sumCrit + sumMaj + sumMin;
    document.getElementById('totalResult').value = total;

    compareAcceptance();
}

function compareAcceptance() {
    const resultTotal = parseInt(document.getElementById('totalResult').value) || 0;
    const acceptanceVal = parseInt(document.getElementById('acceptanceLimit').value);
    const verdictBox = document.getElementById('verdictBox');

    if (isNaN(acceptanceVal)) {
        verdictBox.innerText = 'ESPERANDO DATOS...';
        verdictBox.className = 'verdict-box verdict-default';
        return;
    }

    if (resultTotal > acceptanceVal) {
        verdictBox.innerText = 'FAIL';
        verdictBox.className = 'verdict-box verdict-fail';
    } else {
        verdictBox.innerText = 'PASS';
        verdictBox.className = 'verdict-box verdict-pass';
    }
}
