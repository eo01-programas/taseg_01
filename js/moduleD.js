// Lógica para agregar nuevos P.O. en Módulo D
let poCounter = 1;

function addNextPO() {
    poCounter++;
    const container = document.getElementById('po-container');
    const newPoBlock = document.createElement('div');
    newPoBlock.className = 'po-block';

    newPoBlock.innerHTML = `
        <div class="po-header">Registro de P.O. #${poCounter}</div>
        <div class="field"><label>P.O. Nº</label><input type="text" placeholder="Alfanumérico"></div>
        <div class="field"><label>Item / Style / Product Nº</label><input type="text" placeholder="Alfanumérico"></div>
        <div class="header-row">
            <div class="field"><label>Order Qty Units</label><input type="text" placeholder="Alfanumérico"></div>
            <div class="field"><label>Shipment Qty Units</label><input type="text" placeholder="Alfanumérico"></div>
        </div>
        <div class="field"><label>Shipment Qty Ctns</label><input type="text" placeholder="Alfanumérico"></div>
        <div class="header-row">
            <div class="field"><label>Units Packed in Cartons (Qty)</label><input type="text" placeholder="Alfanumérico"></div>
            <div class="field"><label>Units Packed in Cartons (%)</label><input type="text" placeholder="Alfanumérico"></div>
        </div>
        <div class="field"><label>List of Export Carton Numbers Opened</label><textarea rows="2" placeholder="Ej: 01-05-08-11-12"></textarea></div>
    `;

    container.appendChild(newPoBlock);
}
