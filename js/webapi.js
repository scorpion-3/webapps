let portOpen = false;
let portPromise;
let holdPort = null;
let port;
let reader;

let toggleButton = document.getElementById('toggleButton');
let switchBtn = document.getElementById('switchBtn');
let errMessage = document.getElementById('errorMessage');
let statusBar = document.getElementById('statusBar');
var baudRate;
let outString = "ON";
window.onload = function () {

    if ("serial" in navigator) {

        toggleButton.addEventListener("click", connectUsb);
        switchBtn.addEventListener("click", sendString);
    } else {
        showErrorMessage("Web Serial API is not supported on this browser");
    }
};


function connectUsb() {
    baudRate = document.getElementById("baudRateTxt").value;
    if (baudRate.length > 0) {
        openClose()
        hideErrMessage();
    }
    else {
        showErrorMessage('Enter Baud Rate');
    }
}

async function openClose() {
    if (portOpen) {
        reader.cancel();
        console.log("attempt to close");
    } else {
        portPromise = new Promise((resolve) => {
            (async () => {
                if (holdPort == null) {
                    port = await navigator.serial.requestPort();
                } else {
                    port = holdPort;
                    holdPort = null;
                }
                await port.open({ baudRate: baudRate });
                const textDecoder = new TextDecoderStream();
                reader = textDecoder.readable.getReader();
                const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

                portOpen = true;
                switchBtn.disabled = false;
                toggleButton.innerText = "Disconnect";
                let portInfo = port.getInfo();
                statusBar.innerText =
                    "✅ Connected to device with VID: " +
                    portInfo.usbVendorId +
                    " and PID: " +
                    portInfo.usbProductId;
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        reader.releaseLock();
                        break;
                    }
                }
                await readableStreamClosed.catch((e) => {
                    //showErrorMessage(e)
                });

                await port.close();
                portOpen = false;
                toggleButton.innerText = "Connect";
                switchBtn.disabled = true;
                statusBar.innerText = "❌ USB Device Disconnected";
                console.log("port closed");
                resolve();
            }

            )();
        });
    }
    return;
}
async function sendString() {
    if (switchBtn.value == "ON") {
        switchBtn.value = "OFF";
        switchBtn.innerText = "Switch Off";
        outString = "ON";
    } else {
        switchBtn.value = "ON";
        switchBtn.innerText = "Switch ON"
        outString = "OFF";
    }
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write(outString);
    writer.close();
    await writableStreamClosed;
}

function showErrorMessage(errMsgTxt) {
    errMessage.innerText = errMsgTxt;
    errMessage.style.display = "block";
}
function hideErrMessage() {
    errMessage.innerText = "";
    errMessage.style.display = "none";
}