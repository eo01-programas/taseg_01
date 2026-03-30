// Helper para obtener valor de un elemento
function gv(el) {
    if (!el) return '-';
    if (el.tagName === 'SELECT') {
        if (el.multiple) {
            const sel = Array.from(el.selectedOptions).map(o => o.text);
            return sel.length ? sel.join(', ') : '-';
        }
        // Select simple: devolver el texto de la opción seleccionada
        const idx = el.selectedIndex;
        if (idx >= 0 && el.options[idx] && !el.options[idx].disabled) {
            return el.options[idx].text.trim() || '-';
        }
        return '-';
    }
    return (el.value || '-').trim() || '-';
}

// Generación de PDF
async function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297, margin = 14;
    const col = pageW - margin * 2;
    let y = 0;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Helpers
    function checkPage(needed = 10) {
        if (y + needed > pageH - 20) { doc.addPage(); y = 18; }
    }
    function drawHeader() {
        doc.setFillColor(0, 86, 179);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('QUALITY INSPECTION REPORT', margin, 8);
        doc.text(`Date: ${dateStr}`, pageW - margin, 8, { align: 'right' });
        doc.setTextColor(0, 0, 0);
    }
    function sectionTitle(txt) {
        checkPage(12);
        doc.setFillColor(0, 86, 179);
        doc.rect(margin, y, col, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(txt.toUpperCase(), margin + 2, y + 5);
        doc.setTextColor(0, 0, 0);
        y += 9;
    }
    function row(label, value, shade) {
        const lh = 6;
        checkPage(lh + 2);
        if (shade) { doc.setFillColor(240, 242, 245); doc.rect(margin, y, col, lh, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        doc.setTextColor(85, 85, 85);
        doc.text(label.toUpperCase(), margin + 2, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(value, col * 0.55);
        doc.text(lines, margin + col * 0.43, y + 4);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + lh, margin + col, y + lh);
        y += lh;
    }
    function twoCol(l1, v1, l2, v2, shade) {
        const lh = 6, half = col / 2 - 1;
        checkPage(lh + 2);
        if (shade) { doc.setFillColor(240, 242, 245); doc.rect(margin, y, col, lh, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(85, 85, 85);
        doc.text(l1.toUpperCase(), margin + 2, y + 4);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
        doc.text(v1, margin + half * 0.5, y + 4);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(85, 85, 85);
        doc.text(l2.toUpperCase(), margin + half + 4, y + 4);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
        doc.text(v2, margin + half + half * 0.5, y + 4);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + lh, margin + col, y + lh);
        y += lh;
    }

    // Página 1 Header
    drawHeader();
    y = 18;

    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 86, 179);
    doc.text('INSPECTION REPORT', pageW / 2, y, { align: 'center' }); y += 6;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
    const hSelects = document.querySelectorAll('header select, header input');
    const clientName = gv(document.getElementById('hdrClientName'));
    const inspNum = gv(document.getElementById('hdrInspNum'));
    const reportDate = gv(document.getElementById('hdrReportDate'));
    doc.text(`Client: ${clientName}   |   Inspection Nº: ${inspNum}   |   Report Date: ${reportDate}`, pageW / 2, y, { align: 'center' }); y += 10;

    // MÓDULO A
    const modA = document.getElementById('moduleA');
    const aSelects = modA.querySelectorAll('select');
    const aInputs = modA.querySelectorAll('input, textarea');
    sectionTitle('A. General');
    const aFields = [
        ['Vendor/Supplier Name', gv(aSelects[0])],
        ['MMS Vendor Code', gv(aSelects[1])],
        ['Factory Name', gv(aSelects[2])],
        ['Style Nº', gv(aInputs[0])],
        ['Fabric Mill Name', gv(aSelects[3])],
        ['Main Fabric Article Nº', gv(aInputs[1])],
        ['Brand', gv(aSelects[4])],
        ['Inspection Date', gv(aInputs[2])],
        ['Inspection Location', gv(aInputs[3])],
        ['Season / Year', gv(aInputs[4])],
        ['P.O. Nº', gv(aInputs[5])],
        ['Color Desc.', gv(aInputs[6])],
        ['Color Code', gv(aInputs[7])],
        ['Country of Origin', gv(aSelects[5])],
        ['Protocol Nº', gv(aInputs[8])],
        ['Ship Date', gv(aInputs[9])],
        ['Inspector Name', gv(aInputs[10])],
        ['Service Performed', gv(aSelects[6])],
        ['Country of Distribution', gv(aSelects[7])],
    ];
    aFields.forEach(([l, v], i) => row(l, v, i % 2 === 0));

    // MÓDULO B
    checkPage(15); y += 4;
    sectionTitle('B. Inspection Overall Result Summary');
    const modB = document.getElementById('moduleB');
    row('Overall Result', gv(document.getElementById('resGlobal')), true);
    const pendingBox = document.getElementById('boxPending');
    if (!pendingBox.classList.contains('hidden')) {
        row('Due to', gv(pendingBox.querySelector('textarea')), false);
    }
    y += 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 86, 179);
    doc.text('Checklist Items', margin + 2, y + 4); y += 7;
    const checkItems = modB.querySelectorAll('.check-item');
    checkItems.forEach((item, i) => {
        const lbl = item.querySelector('label').innerText;
        const sel = item.querySelector('select');
        row(lbl, gv(sel), i % 2 === 0);
    });

    // MÓDULO C
    checkPage(15); y += 4;
    sectionTitle('C. Remarks');
    row('Workmanship Defectives', gv(document.getElementById('workmanship')), true);
    row('Measurements Defectives', gv(document.getElementById('measurements')), false);
    row('On-site Defectives', gv(document.getElementById('onsite')), true);
    row('Reject Goods Qty (TOTAL)', gv(document.getElementById('totalReject')), false);
    const modC = document.getElementById('moduleC');
    row('Additional Remarks', gv(modC.querySelector('textarea')), true);

    // MÓDULO D
    checkPage(80); y += 4;
    sectionTitle('D. Quantity');

    const poBlocks = document.querySelectorAll('.po-block');
    const poData = [];
    let cartonLines = [];
    poBlocks.forEach((block) => {
        const inputs = block.querySelectorAll('input, textarea');
        const po = gv(inputs[0]);
        const item = gv(inputs[1]);
        const ordQty = gv(inputs[2]);
        const shipU = gv(inputs[3]);
        const shipC = gv(inputs[4]);
        const packQty = gv(inputs[5]);
        const packPct = gv(inputs[6]);
        const cartons = gv(inputs[7]);
        poData.push({ po, item, ordQty, shipU, shipC, packQty, packPct });
        if (po !== '-' && cartons !== '-') cartonLines.push(`P.O. ${po}    Carton: ${cartons}`);
    });

    const tl = margin;
    const tw = col;
    const rh = 7;
    const hh1 = 8;
    const hh2 = 8;

    const cw = [18, 26, 14, 14, 16, 16, 14, 12, 12, 12, 14, 14];
    const cx = [tl];
    for (let i = 0; i < cw.length - 1; i++) cx.push(cx[i] + cw[i]);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);

    const headerY = y;
    doc.setFillColor(220, 230, 241);
    doc.rect(cx[0], headerY, cw[0], hh1 + hh2, 'FD');
    doc.rect(cx[1], headerY, cw[1], hh1 + hh2, 'FD');
    doc.rect(cx[2], headerY, cw[2], hh1 + hh2, 'FD');
    doc.rect(cx[3], headerY, cw[3] + cw[4], hh1, 'FD');
    doc.rect(cx[5], headerY, cw[5], hh1 + hh2, 'FD');
    doc.rect(cx[6], headerY, cw[6] + cw[7], hh1, 'FD');
    doc.rect(cx[8], headerY, cw[8] + cw[9], hh1, 'FD');
    doc.rect(cx[10], headerY, cw[10] + cw[11], hh1, 'FD');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(0, 0, 0);
    const ctr = (x, w, txt, yy) => {
        doc.setTextColor(0, 0, 0);
        doc.text(String(txt), x + w / 2, yy, { align: 'center' });
    };
    const multiLine = (x, w, lines, yy) => {
        doc.setTextColor(0, 0, 0);
        lines.forEach((l, i) => doc.text(l, x + w / 2, yy + i * 3.5, { align: 'center' }));
    };

    multiLine(cx[0], cw[0], ['P.O.', 'No.'], headerY + 3);
    multiLine(cx[1], cw[1], ['Item/Style/', 'Product No.'], headerY + 4);
    multiLine(cx[2], cw[2], ['Order', 'Qty', 'Units'], headerY + 3);
    ctr(cx[3], cw[3] + cw[4], 'Shipment Quantity', headerY + 5);
    multiLine(cx[5], cw[5], ['Presented', 'Qty for', 'Insp.'], headerY + 3);
    ctr(cx[6], cw[6] + cw[7], 'Units Packed in Cartons', headerY + 5);
    multiLine(cx[8], cw[8] + cw[9], ['Units Finished', 'Not Packed'], headerY + 4);
    multiLine(cx[10], cw[10] + cw[11], ['Units Not', 'Finished'], headerY + 4);

    const h2Y = headerY + hh1;
    doc.setFillColor(220, 230, 241);
    doc.rect(cx[3], h2Y, cw[3], hh2, 'FD');
    doc.rect(cx[4], h2Y, cw[4], hh2, 'FD');
    doc.rect(cx[6], h2Y, cw[6], hh2, 'FD');
    doc.rect(cx[7], h2Y, cw[7], hh2, 'FD');
    doc.rect(cx[8], h2Y, cw[8], hh2, 'FD');
    doc.rect(cx[9], h2Y, cw[9], hh2, 'FD');
    doc.rect(cx[10], h2Y, cw[10], hh2, 'FD');
    doc.rect(cx[11], h2Y, cw[11], hh2, 'FD');

    doc.setFontSize(6.5);
    ctr(cx[3], cw[3], 'Units', h2Y + 5);
    ctr(cx[4], cw[4], 'Cartons', h2Y + 5);
    ctr(cx[6], cw[6], 'Qty', h2Y + 5);
    ctr(cx[7], cw[7], '%', h2Y + 5);
    ctr(cx[8], cw[8], 'Qty', h2Y + 5);
    ctr(cx[9], cw[9], '%', h2Y + 5);
    ctr(cx[10], cw[10], 'Qty', h2Y + 5);
    ctr(cx[11], cw[11], '%', h2Y + 5);

    y = h2Y + hh2;

    let totOrd = 0, totShipU = 0, totShipC = 0, totPack = 0;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
    poData.forEach((d, i) => {
        checkPage(rh + 2);
        if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(tl, y, tw, rh, 'F'); }
        doc.setDrawColor(180, 180, 180);
        cw.forEach((w, ci) => doc.rect(cx[ci], y, w, rh, 'D'));
        doc.setTextColor(30, 30, 30);
        ctr(cx[0], cw[0], d.po, y + 4.5);
        ctr(cx[1], cw[1], d.item, y + 4.5);
        ctr(cx[2], cw[2], d.ordQty, y + 4.5);
        ctr(cx[3], cw[3], d.shipU, y + 4.5);
        ctr(cx[4], cw[4], d.shipC, y + 4.5);
        ctr(cx[5], cw[5], d.shipU, y + 4.5);
        ctr(cx[6], cw[6], d.packQty, y + 4.5);
        const rowOrd = parseInt(d.ordQty) || 0;
        const rowPack = parseInt(d.packQty) || 0;
        const rowPct = d.packPct && d.packPct !== '-'
            ? d.packPct
            : (rowOrd > 0 ? Math.round((rowPack / rowOrd) * 100) + '%' : '-');
        ctr(cx[7], cw[7], rowPct, y + 4.5);
        ctr(cx[8], cw[8], '-', y + 4.5);
        ctr(cx[9], cw[9], '-', y + 4.5);
        ctr(cx[10], cw[10], '-', y + 4.5);
        ctr(cx[11], cw[11], '-', y + 4.5);
        y += rh;
        totOrd += parseInt(d.ordQty) || 0;
        totShipU += parseInt(d.shipU) || 0;
        totShipC += parseInt(d.shipC) || 0;
        totPack += parseInt(d.packQty) || 0;
    });

    checkPage(rh + 2);
    doc.setFillColor(220, 230, 241);
    doc.rect(tl, y, tw, rh, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(0, 0, 0);
    doc.text('Total:', cx[1] + cw[1] / 2, y + 4.5, { align: 'center' });
    const totPct = totOrd > 0 ? Math.round((totPack / totOrd) * 100) + '%' : '-';
    ctr(cx[2], cw[2], totOrd > 0 ? String(totOrd) : '-', y + 4.5);
    ctr(cx[3], cw[3], totShipU > 0 ? String(totShipU) : '-', y + 4.5);
    ctr(cx[4], cw[4], totShipC > 0 ? String(totShipC) : '-', y + 4.5);
    ctr(cx[5], cw[5], totShipU > 0 ? String(totShipU) : '-', y + 4.5);
    ctr(cx[6], cw[6], totPack > 0 ? String(totPack) : '-', y + 4.5);
    ctr(cx[7], cw[7], totPct, y + 4.5);
    [8, 9, 10, 11].forEach(i => ctr(cx[i], cw[i], '-', y + 4.5));
    y += rh;

    if (cartonLines.length > 0) {
        checkPage(cartonLines.length * 5 + 12);
        const cartonH = cartonLines.length * 5 + 10;
        const lw = cw[0] + cw[1];
        doc.setFillColor(248, 248, 248);
        doc.rect(tl, y, tw, cartonH, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(0, 0, 0);
        const labelLines = ['List of Export Carton', 'Numbers Opened'];
        labelLines.forEach((l, i) => doc.text(l, tl + 2, y + 4 + i * 4.5));
        doc.line(tl + lw, y, tl + lw, y + cartonH);
        doc.setFont('helvetica', 'normal');
        cartonLines.forEach((l, i) => doc.text(l, tl + lw + 3, y + 4 + i * 5));
        y += cartonH + 2;
    }

    // MÓDULO E
    checkPage(60); y += 4;
    sectionTitle('E. Workmanship (Basic Function & Appearance)');

    const modE = document.getElementById('moduleE');
    const eInputs = modE.querySelectorAll('input');
    const eSelects = modE.querySelectorAll('select');

    const eStandard = gv(eInputs[0]);
    const eLevel = gv(eSelects[0]);
    const ePlan = gv(eSelects[1]);
    const eSampleSz = gv(eInputs[2]);
    const eAqlMaj = gv(eSelects[2]);
    const eAqlMin = gv(eSelects[3]);

    const bdr = 0.3;
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(bdr);

    const cell = (x, cy, w, h, txt, bold, shade, fontSize) => {
        if (shade) { doc.setFillColor(240, 242, 245); doc.rect(x, cy, w, h, 'FD'); }
        else doc.rect(x, cy, w, h, 'D');
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(fontSize || 7);
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(txt, w - 2);
        doc.text(lines, x + 2, cy + 4.5);
    };
    const rh6 = 6.5;
    const lw2 = 55, rw2 = col - lw2;

    cell(margin, y, lw2, rh6, 'Inspection Standard:', true, true);
    cell(margin + lw2, y, rw2, rh6, eStandard, false, false);
    y += rh6;

    const h2w1 = 55, h2w2 = 28, h2w3 = 60, h2w4 = col - h2w1 - h2w2 - h2w3;
    cell(margin, y, h2w1, rh6, 'Inspection Level - Workmanship / Visual:', true, true);
    cell(margin + h2w1, y, h2w2, rh6, eLevel, false, false, 8);
    cell(margin + h2w1 + h2w2, y, h2w3, rh6, 'AQL - Critical Defectives:', true, true);
    cell(margin + h2w1 + h2w2 + h2w3, y, h2w4, rh6, 'Not allowed', false, false, 8);
    y += rh6;

    const r3h = rh6 * 2;
    const r3w1 = 55, r3w2 = 28, r3w3 = 60, r3w4 = col - r3w1 - r3w2 - r3w3;
    cell(margin, y, r3w1, r3h, 'Sampling Plan - Workmanship / Visual:', true, true);
    cell(margin + r3w1, y, r3w2, r3h, ePlan, false, false, 8);
    cell(margin + r3w1 + r3w2, y, r3w3, rh6, 'AQL - Major Defectives:', true, true);
    cell(margin + r3w1 + r3w2 + r3w3, y, r3w4, rh6, eAqlMaj, false, false, 8);
    cell(margin + r3w1 + r3w2, y + rh6, r3w3, rh6, 'AQL - Minor Defectives:', true, true);
    cell(margin + r3w1 + r3w2 + r3w3, y + rh6, r3w4, rh6, eAqlMin, false, false, 8);
    y += r3h;

    const r4w = [55, 16, 16, 16, 16, 16, 47];
    const r4x = [margin];
    for (let i = 0; i < r4w.length - 1; i++) r4x.push(r4x[i] + r4w[i]);
    cell(r4x[0], y, r4w[0], rh6, 'Sample Size - Workmanship / Visual:', true, true);
    cell(r4x[1], y, r4w[1], rh6, 'Critical:', true, false);
    cell(r4x[2], y, r4w[2], rh6, eSampleSz, false, false, 8);
    cell(r4x[3], y, r4w[3], rh6, 'Major:', true, true);
    cell(r4x[4], y, r4w[4], rh6, eSampleSz, false, true, 8);
    cell(r4x[5], y, r4w[5], rh6, 'Minor:', true, false);
    cell(r4x[6], y, r4w[6], rh6, eSampleSz, false, false, 8);
    y += rh6 + 2;

    const dCol = col - 28 - 24 - 24;
    const dCrit = 28, dMaj = 24, dMin = 24;
    const dxDesc = margin, dxCrit = margin + dCol, dxMaj = dxCrit + dCrit, dxMin = dxMaj + dMaj;

    doc.setFillColor(220, 230, 241);
    doc.rect(dxDesc, y, dCol, rh6, 'FD');
    doc.rect(dxCrit, y, dCrit, rh6, 'FD');
    doc.rect(dxMaj, y, dMaj, rh6, 'FD');
    doc.rect(dxMin, y, dMin, rh6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 0, 0);
    doc.text('Defective Description', dxDesc + 2, y + 4.5);
    doc.text('Critical', dxCrit + dCrit / 2, y + 4.5, { align: 'center' });
    doc.text('Major', dxMaj + dMaj / 2, y + 4.5, { align: 'center' });
    doc.text('Minor', dxMin + dMin / 2, y + 4.5, { align: 'center' });
    y += rh6;

    const defectBlocks = modE.querySelectorAll('.defect-block');
    let sumCrit = 0, sumMaj = 0, sumMin = 0, defIdx = 0;
    const defects = [];
    defectBlocks.forEach(b => {
        const dw = b.querySelector('.defect-weight');
        const dq = b.querySelector('.defect-qty');
        const ds = b.querySelector('select:not(.defect-weight)');
        const dpo = b.querySelectorAll('input')[0];
        const dss = b.querySelectorAll('input')[1];
        const weight = gv(dw);
        const qty = parseInt(gv(dq)) || 0;
        const type = gv(ds);
        const po = gv(dpo);
        const ss = gv(dss);
        defects.push({ weight, qty, type, po, ss });
    });

    const poGroups = {};
    defects.forEach(d => {
        if (!poGroups[d.po]) poGroups[d.po] = { ss: d.ss, list: [] };
        poGroups[d.po].list.push(d);
    });

    Object.entries(poGroups).forEach(([po, group]) => {
        let poCrit = 0, poMaj = 0, poMin = 0;
        group.list.forEach(d => {
            if (d.weight === 'Critical') poCrit += d.qty;
            else if (d.weight === 'Major') poMaj += d.qty;
            else poMin += d.qty;
        });

        checkPage(rh6 + 2);
        doc.setFillColor(245, 245, 245);
        doc.rect(dxDesc, y, col, rh6, 'FD');
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(50, 50, 50);
        const poHdrTxt = po !== '-'
            ? `For PO # ${po}   Item # ${group.list[0].type !== '-' ? '' : '-'}   (Sample size: ${group.ss} ; Defective: Major ${poMaj}, Minor ${poMin})`
            : `Group (Sample size: ${group.ss} ; Defective: Major ${poMaj}, Minor ${poMin})`;
        doc.text(poHdrTxt, dxDesc + 2, y + 4.5);
        y += rh6;

        group.list.forEach(d => {
            defIdx++;
            checkPage(rh6 + 2);
            if (defIdx % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(dxDesc, y, col, rh6, 'F'); }
            doc.setDrawColor(180, 180, 180);
            doc.rect(dxDesc, y, dCol, rh6, 'D');
            doc.rect(dxCrit, y, dCrit, rh6, 'D');
            doc.rect(dxMaj, y, dMaj, rh6, 'D');
            doc.rect(dxMin, y, dMin, rh6, 'D');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(30, 30, 30);
            doc.text(`${defIdx}.`, dxDesc + 2, y + 4.5);
            doc.text(d.type, dxDesc + 10, y + 4.5);
            const cVal = d.weight === 'Critical' ? d.qty : 0;
            const mVal = d.weight === 'Major' ? d.qty : 0;
            const nVal = d.weight === 'Minor' ? d.qty : 0;
            doc.text(String(cVal), dxCrit + dCrit / 2, y + 4.5, { align: 'center' });
            doc.text(String(mVal), dxMaj + dMaj / 2, y + 4.5, { align: 'center' });
            doc.text(String(nVal), dxMin + dMin / 2, y + 4.5, { align: 'center' });
            sumCrit += cVal; sumMaj += mVal; sumMin += nVal;
            y += rh6;
        });
    });

    const accept = parseInt(gv(document.getElementById('acceptanceLimit'))) || 0;
    const totalFoundTxt = 'Total Found:';
    const acceptTxt = 'Accept:';
    const resultTxt = 'Result:';
    const verdict = document.getElementById('verdictBox').innerText.trim() || 'PENDING';

    checkPage(rh6 * 3 + 14);
    doc.setFillColor(240, 242, 245);
    doc.rect(dxDesc, y, dCol, rh6, 'FD');
    doc.rect(dxCrit, y, dCrit, rh6, 'FD');
    doc.rect(dxMaj, y, dMaj, rh6, 'FD');
    doc.rect(dxMin, y, dMin, rh6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 0, 0);
    doc.text(totalFoundTxt, dxDesc + dCol - 2, y + 4.5, { align: 'right' });
    doc.text(String(sumCrit), dxCrit + dCrit / 2, y + 4.5, { align: 'center' });
    doc.text(String(sumMaj), dxMaj + dMaj / 2, y + 4.5, { align: 'center' });
    doc.text('NA', dxMin + dMin / 2, y + 4.5, { align: 'center' });
    y += rh6;

    doc.setFillColor(248, 248, 248);
    doc.rect(dxDesc, y, dCol, rh6, 'FD');
    doc.rect(dxCrit, y, dCrit, rh6, 'FD');
    doc.rect(dxMaj, y, dMaj, rh6, 'FD');
    doc.rect(dxMin, y, dMin, rh6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text(acceptTxt, dxDesc + dCol - 2, y + 4.5, { align: 'right' });
    doc.text(String(sumCrit > 0 ? 0 : '-'), dxCrit + dCrit / 2, y + 4.5, { align: 'center' });
    doc.text(String(accept), dxMaj + dMaj / 2, y + 4.5, { align: 'center' });
    doc.text('NA', dxMin + dMin / 2, y + 4.5, { align: 'center' });
    y += rh6;

    const vColorE = verdict.includes('PASS') ? [40, 167, 69] : verdict.includes('FAIL') ? [220, 53, 69] : [108, 117, 125];
    doc.setFillColor(...vColorE);
    doc.rect(dxDesc, y, col, rh6 + 2, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text(resultTxt, dxDesc + dCol - 2, y + 5, { align: 'right' });
    doc.text(verdict, dxDesc + dCol + (dCrit + dMaj + dMin) / 2 + dxDesc, y + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0); y += rh6 + 6;

    // MÓDULO F
    checkPage(15); y += 4;
    sectionTitle('F. Packing & Assortment');
    const modF = document.getElementById('moduleF');
    const fInputs = modF.querySelectorAll('input');
    const fSelects = modF.querySelectorAll('select');
    row('Description', gv(fInputs[0]), true);
    row('Sample Size (cartons)', gv(fInputs[1]), false);
    row('Calibration Label', gv(fSelects[0]), true);
    row('Findings', gv(document.getElementById('findingsF')), false);
    row('Result', document.getElementById('resultBoxF').innerText, true);

    // MÓDULO G
    checkPage(15); y += 4;
    sectionTitle('G. On-Site Tests');
    const testSections = document.querySelectorAll('#moduleG .test-section');
    const testNames = ['Carton weight and dimension measurement', 'Color Evaluation', 'Metal detections test', 'Carton drop test'];
    const resIds = ['res1', 'res2', 'res3', 'res4'];
    testSections.forEach((ts, i) => {
        checkPage(10);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 86, 179);
        doc.text(`${i + 1}. ${testNames[i]}`, margin + 2, y + 4); y += 7;
        const tsInputs = ts.querySelectorAll('input');
        const tsSelects = ts.querySelectorAll('select');
        const textarea = ts.querySelector('textarea');
        row('Sample Size', gv(tsInputs[0]), true);
        row('Test with factory equip.', gv(tsSelects[0]), false);
        row('Calibration label', gv(tsSelects[1]), true);
        row('Findings', gv(tsSelects[2]), false);
        if (textarea) row('Comments', gv(textarea), true);
        row('Result', document.getElementById(resIds[i]).innerText, false);
    });

    // MÓDULO H – Fotografías
    if (capturedPhotos.length > 0) {
        doc.addPage(); y = 18; drawHeader();
        sectionTitle('H. Photographs');

        const cols3 = 3;
        const gap = 4;
        const cellW = (col - gap * (cols3 - 1)) / cols3;
        const imgH = cellW * 0.65;
        const titleH = 6;
        const cellH = imgH + titleH + 2;

        let photoCount = 0;
        let colIdx = 0;
        let rowStartY = y;

        for (let i = 0; i < capturedPhotos.length; i++) {
            const { dataUrl: dataUrlOrig, title } = capturedPhotos[i];
            const dataUrl = await compressImage(dataUrlOrig, 600, 0.6);

            if (photoCount > 0 && photoCount % 9 === 0) {
                doc.addPage(); y = 18; drawHeader();
                sectionTitle('H. Photographs (cont.)');
                rowStartY = y;
                colIdx = 0;
            }

            if (colIdx === cols3) {
                rowStartY += cellH + gap;
                colIdx = 0;
                if (rowStartY + cellH > pageH - 20) {
                    doc.addPage(); y = 18; drawHeader();
                    sectionTitle('H. Photographs (cont.)');
                    rowStartY = y;
                }
            }

            const cellX = margin + colIdx * (cellW + gap);

            doc.addImage(dataUrl, 'JPEG', cellX, rowStartY, cellW, imgH);
            doc.setDrawColor(0, 86, 179); doc.setLineWidth(0.3);
            doc.rect(cellX, rowStartY, cellW, imgH);

            doc.setFont('helvetica', 'bold'); doc.setFontSize(6);
            doc.setTextColor(0, 86, 179);
            const titleLines = doc.splitTextToSize(title, cellW - 1);
            doc.text(titleLines[0], cellX + 1, rowStartY + imgH + 4.5);

            colIdx++;
            photoCount++;
        }
        y = rowStartY + cellH + gap;
    } else {
        checkPage(15); y += 4;
        sectionTitle('H. Photographs');
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
        doc.text('No se capturaron fotografias en esta sesion.', margin + 2, y + 5); y += 10;
    }

    // Comentarios finales
    const finalComments = document.getElementById('finalComments').value.trim();
    if (finalComments) {
        checkPage(20); y += 4;
        sectionTitle('Comments / Additional Notes');
        const lines = doc.splitTextToSize(finalComments, col - 4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(50, 50, 50);
        lines.forEach(line => { checkPage(6); doc.text(line, margin + 2, y + 4); y += 5; });
    }

    // Firma / Footer
    checkPage(30); y += 8;
    doc.setDrawColor(0, 86, 179); doc.line(margin, y, margin + 70, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(30, 30, 30);
    doc.text('Report Reviewer Name: Judith Ramirez', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, margin, y + 11);

    // Pie de página en cada página
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(0, 86, 179);
        doc.rect(0, pageH - 8, pageW, 8, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text(`Quality Inspection Report  |  Client: ${clientName}  |  ${dateStr}  |  Page ${p} of ${totalPages}`, pageW / 2, pageH - 3, { align: 'center' });
    }

    // Nombre de archivo — fecha con guion bajo en vez de guion
    const clientNameClean = (clientName !== '-' ? clientName : 'CLIENT').replace(/[\\\/:\*\?"<>|]/g, '');
    const inspNumClean = (inspNum !== '-' ? inspNum : 'XXXX').replace(/[\\\/:\*\?"<>|]/g, '');
    const reportDateClean = (reportDate !== '-' ? reportDate : 'DATE').replace(/[\\\/:\*\?"<>|]/g, '').replace(/-/g, '_');
    const filename = `${clientNameClean}_${inspNumClean}_${reportDateClean}.pdf`;

    // Guardar datos en Google Sheets
    const overallResult = (gv(document.getElementById('resGlobal')) || '').toUpperCase();
    const rejectQtyVal = gv(document.getElementById('totalReject')) || '0';
    const modAEl = document.getElementById('moduleA');
    const aInputsR = modAEl ? modAEl.querySelectorAll('input') : [];
    const colorNameVal = aInputsR[6] ? aInputsR[6].value : '';
    const poValR = aInputsR[5] ? aInputsR[5].value : '';

    const datosReporte = {
        numReporte: inspNum,
        fechaReporte: reportDate,
        cliente: clientName,
        po: poValR,
        colorName: colorNameVal,
        result: overallResult,
        rejectQty: rejectQtyVal,
        url: ''
    };
    try {
        showSavingModal();
        updateSavingProgress('Generando documento PDF...', 'Esto puede tomar unos segundos.');

        const pdfOutput = doc.output('datauristring');
        const base64 = pdfOutput.split(',')[1];
        
        // 1. Intentar subir PDF a Google Drive
        updateSavingProgress('Subiendo PDF a Google Drive...', 'Conectando con el servidor...');
        
        let driveUrl = '';
        try {
            const uploadResult = await guardarPdfEnDriveDesdeApp(inspNum, base64, filename);
            if (uploadResult && uploadResult.url) {
                driveUrl = uploadResult.url;
                datosReporte.url = driveUrl;
            }
        } catch (driveErr) {
            console.warn('Error en Drive (se intentará registrar solo en Sheets):', driveErr);
        }

        // 2. Registrar el reporte en Sheets
        updateSavingProgress('Registrando inspección en Sheets...', 'Confirmando datos finales...');
        await registrarReporteEnSheets(datosReporte);
        
        // ÉXITO FINAL
        showSavingSuccess(datosReporte, driveUrl);

    } catch (err) {
        console.error('Error crítico al guardar:', err);
        const errMsg = err.message || 'Error desconocido';
        updateSavingProgress('Error al guardar', errMsg, true);
    }
}

// Funciones para el Modal de Guardado
function showSavingModal() {
    const modal = document.getElementById('savingModal');
    modal.classList.remove('hidden');
    document.getElementById('savingSpinner').classList.remove('hidden');
    document.getElementById('savingCheck').classList.add('hidden');
    document.getElementById('savingSummary').classList.add('hidden');
    document.getElementById('btn-close-saving').classList.add('hidden');
    document.getElementById('savingTitle').textContent = 'Guardando...';
}

function updateSavingProgress(title, text, isError = false) {
    document.getElementById('savingTitle').textContent = title;
    document.getElementById('savingText').textContent = text;
    if (isError) {
        document.getElementById('savingSpinner').classList.add('hidden');
        document.getElementById('btn-close-saving').classList.remove('hidden');
        document.getElementById('savingTitle').style.color = 'var(--danger)';
    }
}

function showSavingSuccess(datos, driveUrl) {
    document.getElementById('savingSpinner').classList.add('hidden');
    document.getElementById('savingCheck').classList.remove('hidden');
    document.getElementById('savingSummary').classList.remove('hidden');
    document.getElementById('savingTitle').textContent = '¡Reporte Guardado!';
    document.getElementById('savingTitle').style.color = 'var(--success)';
    document.getElementById('savingText').textContent = 'La inspección se ha registrado correctamente.';
    
    // Rellenar resumen
    document.getElementById('sumInspNum').textContent = datos.numReporte || 'N/A';
    document.getElementById('sumClient').textContent = datos.cliente || 'N/A';
    document.getElementById('sumDate').textContent = datos.fechaReporte || 'HOY';
    
    const btnPdf = document.getElementById('btn-sum-pdf');
    if (driveUrl) {
        btnPdf.href = driveUrl;
        btnPdf.style.display = 'block';
    } else {
        btnPdf.style.display = 'none';
    }
}

function closeSavingModal() {
    document.getElementById('savingModal').classList.add('hidden');
}
// Función para comprimir imágenes antes de procesar
async function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}
