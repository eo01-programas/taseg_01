// URL expuesta por Google Apps Script tras publicar como Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_rayPeIh68_L_N89LFp72taozfN92mD2wjzMaEQArVCadSwgu016ZMhvjqjq3xNQN/exec';

// Todas las peticiones se hacen a traves del proxy CORS para evitar bloqueos del navegador
const PROXY = 'https://corsproxy.io/?';
const PROXY_URL = PROXY + encodeURIComponent(SCRIPT_URL);

// POST al Apps Script via proxy CORS
async function callAppsScript(payload, timeoutMs) {
    timeoutMs = timeoutMs || 30000;
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeoutMs);

    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') throw new Error('Tiempo de espera agotado');
        throw err;
    }
}

// GET al Apps Script via proxy CORS
async function getFromScript(params, timeoutMs) {
    timeoutMs = timeoutMs || 30000;
    // Cache-buster para asegurar datos frescos
    params['_'] = new Date().getTime();

    const qs = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    const fullUrl = PROXY + encodeURIComponent(SCRIPT_URL + '?' + qs);
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeoutMs);

    try {
        const res = await fetch(fullUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') throw new Error('Tiempo de espera agotado');
        throw err;
    }
}
