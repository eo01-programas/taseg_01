// URL expuesta por Google Apps Script tras publicar como Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfWbG-YsCvVP_v-ko1XgirFCSpVlua_n86j3NWmgu95W9MBOvrJWfe-4Y1TqJvmkI7/exec';

async function callAppsScript(payload, timeoutMs = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log("Iniciando POST a:", SCRIPT_URL, payload);
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow', // IMPORTANTE para Google Apps Script
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);
        return await response.json();
    } catch (err) {
        clearTimeout(timer);
        console.error("Error definitivo en callAppsScript:", err);
        throw new Error("No se pudo conectar con el servidor (POST). Verifica que el script esté publicado como 'Cualquiera'.");
    }
}

async function getFromScript(params, timeoutMs = 30000) {
    params['_'] = new Date().getTime();
    const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const targetUrl = SCRIPT_URL + '?' + qs;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log("Iniciando GET a:", targetUrl);
        const response = await fetch(targetUrl, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow', // Crucial para Google Apps Script
            signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) throw new Error("HTTP " + response.status);

        const data = await response.json();
        console.log("Datos recibidos:", data);
        return data;
    } catch (err) {
        clearTimeout(timer);
        console.error("Error en getFromScript (GET):", err);

        // Intentar un último recurso: Usar un proxy muy simple si el directo falló por CORS
        try {
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
            const res = await fetch(proxyUrl);
            return await res.json();
        } catch (err2) {
            throw new Error("Error de conexión: Verifica que el script esté publicado como 'Cualquiera' y con el ID de hoja correcto.");
        }
    }
}
