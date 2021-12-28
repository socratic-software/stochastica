// ****************************************************************
// Copyright I.T. Young & R. Ligteringen, 1984, 2010–2022
// Licensed under the MIT license.
// ****************************************************************
// Determines which platform the demo runs on
var isMobile = {
    /**
     * @return {boolean}
     */
    Android: function () {
        return /Android/i.test(navigator.userAgent);
    },
    /**
     * @return {boolean}
     */
    BlackBerry: function () {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function () {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS());
    }
};


/**
 * Debug output messages
 *
 * @param msg The message to show
 */
msgBuffer = [];
var consoleMessage = function (msg) {
    console.log(msg);
//     msgBuffer.push(msg);
//     document.getElementById("infoMessage").innerHTML = '';
//     for (const m of msgBuffer) {
//         var node =  document.createElement("P");
//         var textnode = document.createTextNode(m);
//         node.appendChild(textnode);
//         document.getElementById("infoMessage").appendChild(node);
//     }
};

/**
 * Get a formatted YYYYMMDDHHMMSS string from the date
 * @returns {*}
 */
Date.prototype.YYYYMMDDHHMMSS = function () {
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    return this.getFullYear() +
        pad2(this.getMonth() + 1) +
        pad2(this.getDate()) +
        pad2(this.getHours()) +
        pad2(this.getMinutes()) +
        pad2(this.getSeconds());
};

var disableStartButton = function () {
    document.getElementById("startCapture").disabled = true;
    document.getElementById("stopCapture").disabled = false;
    document.getElementById("playCapture").disabled = true;
};

var disableStopButton = function () {
    document.getElementById("startCapture").disabled = false;
    document.getElementById("stopCapture").disabled = true;
};

var disableAllButtons = function () {
    document.getElementById("startCapture").disabled = true;
    document.getElementById("stopCapture").disabled = true;
    document.getElementById("playCapture").disabled = true;
};

/**
 *
 * @param onSuccess
 * @param onDenied
 * @param onError
 */
var getMicrophonePermission = function (onSuccess, onDenied, onError) {
    window.audioinput.checkMicrophonePermission(function (hasPermission) {
        try {
            if (hasPermission) {
                if (onSuccess) onSuccess();
            }
            else {
                window.audioinput.getMicrophonePermission(function (hasPermission, message) {
                    try {
                        if (hasPermission) {
                            if (onSuccess) onSuccess();
                        }
                        else {
                            if (onDenied) onDenied("User denied permission to record: " + message);
                        }
                    }
                    catch (ex) {
                        if (onError) onError("Start after getting permission exception: " + ex);
                    }
                });
            }
        }
        catch (ex) {
            if (onError) onError("getMicrophonePermission exception: " + ex);
        }
    });
};

/**
 * Ensure that plugin is stopped when exiting the current web page.
 */
var handleBackBtn = function () {
    if (window.audioinput && window.audioinput.isCapturing()) window.audioinput.stop();
};

try {
    document.getElementById("backBtn").addEventListener("click", handleBackBtn);
}
catch (ex) {
    console.warn("No backBtn found.");
}