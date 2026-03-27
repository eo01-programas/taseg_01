// Lógica del Módulo G - On-Site Tests
function updateResult(selectElement, resultId) {
    const verdict = document.getElementById(resultId);
    if (selectElement.value === "Yes") {
        verdict.innerText = "RESULT: FAIL";
        verdict.className = "verdict-box verdict-fail";
    } else if (selectElement.value === "No") {
        verdict.innerText = "RESULT: PASS";
        verdict.className = "verdict-box verdict-pass";
    } else {
        verdict.innerText = "RESULT: PENDING";
        verdict.className = "verdict-box verdict-default";
    }
}
