/**
 * On load
 */
function onLoad() {
    Lumen.bootstrap("#main-container", "Shell", true).then(() => {
        Lumen.setTheme("theme-light");
    });
}