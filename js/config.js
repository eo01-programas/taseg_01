// URL expuesta por Google Apps Script tras publicar como Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSta8r1tqTJR2seX1ev2hZam2qk_eXadEZyCcWPS0YDXEUwlzr03vd2nXO7T7lUpc3/exec';

async function callAppsScript(payload, timeoutMs = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log("Iniciando POST a:", SCRIPT_URL, payload);
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Algunos navegadores requieren esto para POST a dominios distintos si no hay preflight
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);
        // Nota: Con no-cors no podemos leer la respuesta, pero para registrar datos suele bastar.
        // Sin embargo, como necesitamos el JSON de confirmación, intentamos con cors primero.
    } catch (err) {}

    // Intento 2: Conexión estándar con lectura de respuesta
    const controller2 = new AbortController();
    const timer2 = setTimeout(() => controller2.abort(), timeoutMs);
    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
            signal: controller2.signal
        });
        clearTimeout(timer2);
        return await res.json();
    } catch (err) {
        clearTimeout(timer2);
        console.error("Error definitivo en callAppsScript:", err);
        throw new Error("No se pudo conectar con el servidor (POST).");
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
