var inputBox = document.getElementById("inputCapture");
var listEvent = document.getElementById("listEvent");
var keyStroke = document.getElementById("keyStroke");
document.addEventListener("DOMContentLoaded", startCapture());
function startCapture() {
    inputBox.addEventListener("keydown", function (event) {
        listEvent.textContent = event.type;
        if (/^[a-zA-Z0-9]$/.test(event.key)) {
            keyStroke.textContent += event.key;
        }
    });
}
function clearAll() {
    listEvent.textContent = "";
    keyStroke.textContent = "";
    inputBox.value = "";
}