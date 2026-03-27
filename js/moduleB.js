// Generación del checklist del Módulo B
(function() {
    const items = [
        "Shipping Marks", "Product Conformity Style", "Product Conformity Material",
        "Product Conformity Color", "Workmanship / Appearance / Function (Section E)",
        "Extended POM Check", "Measurement", "Packing & Assortment - Export carton packing",
        "Packing & Assortment - Inner carton packing", "Packing & Assortment - Product packaging",
        "Packing & Assortment - Assortment (color/style/size)", "Labeling",
        "Printed Materials", "Marking", "On-site Tests - Barcode Presence Verification",
        "Weight", "Others", "Program Specific Requierements", "Inspection Conditions"
    ];
    const container = document.getElementById('checkListModuleB');
    if (!container) return;
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'check-item';
        div.innerHTML = `
            <label>${index + 1}. ${item}</label>
            <select>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="PENDING FOR CLIENT DECISION">PENDING FOR CLIENT DECISION</option>
                <option value="N/A">N/A</option>
                <option value="REMARK">REMARK</option>
            </select>
        `;
        container.appendChild(div);
    });
})();

// Lógica de pendientes en Módulo B
function checkPending() {
    const val = document.getElementById('resGlobal').value;
    const box = document.getElementById('boxPending');
    val === 'PENDING' ? box.classList.remove('hidden') : box.classList.add('hidden');
}
