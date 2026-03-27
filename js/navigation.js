// Navegación entre módulos
function goToModule(targetModuleId) {
    document.querySelectorAll('.app-module').forEach(el => el.classList.remove('active'));
    document.getElementById(targetModuleId).classList.add('active');
    window.scrollTo(0, 0);
}
