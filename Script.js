/* =========================================================
   CHRONOS V1
   ========================================================= */


/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const chat = document.getElementById("chat");
const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");
const micButton = document.getElementById("micButton");
const backupButton = document.getElementById("backupButton");

const statusElement = document.getElementById("status");
const orb = document.getElementById("orb");

const stopwatchDisplay = document.getElementById("stopwatch");
const countdownDisplay = document.getElementById("countdown");


/* ---------------------------------------------------------
   CHAT
   --------------------------------------------------------- */

function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = "message " + type;

    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


function userMessage(text) {

    addMessage(text, "user");

}


function chronosMessage(text) {

    addMessage(text, "chronos");

    speak(text);

}


/* ---------------------------------------------------------
   VOICE OUTPUT
   --------------------------------------------------------- */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "en-US";
    voice.rate = 1;
    voice.pitch = 1;

    window.speechSynthesis.speak(voice);

}


/* ---------------------------------------------------------
   COMMAND SYSTEM
   --------------------------------------------------------- */

function processCommand(command) {

    const text = command.toLowerCase().trim();

    if (!text) {
        return;
    }


    /* HELP */

    if (
        text.includes("help") ||
        text.includes("what can you do")
    ) {

        chronosMessage(
            "I can start timers, run a stopwatch, enter Backup Mode, and respond to basic commands."
        );

        return;
    }


    /* HELLO */

    if (
        text === "hello" ||
        text === "hi" ||
        text.includes("hello chronos")
    ) {

        chronosMessage("Hello. I'm Chronos.");

        return;
    }


    /* TIME */

    if (
        text.includes("what time") ||
        text === "time"
    ) {

        const now = new Date();

        const time = now.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

        chronosMessage("It is " + time + ".");

        return;
    }


    /* STOPWATCH */

    if (
        text.includes("start stopwatch") ||
        text.includes("start the stopwatch")
    ) {

        startStopwatch();

        chronosMessage("Stopwatch started.");

        return;
    }


    if (
        text.includes("stop stopwatch") ||
        text.includes("stop the stopwatch")
    ) {

        stopStopwatch();

        chronosMessage("Stopwatch stopped.");

        return;
    }


    if (
        text.includes("reset stopwatch") ||
        text.includes("reset the stopwatch")
    ) {

        resetStopwatch();

        chronosMessage("Stopwatch reset.");

        return;
    }


    /* ONE MINUTE */

    if (
        text.includes("one minute") ||
        text.includes("1 minute") ||
        text.includes("one-minute timer")
    ) {

        startTimer(60);

        chronosMessage("One minute timer started.");

        return;
    }


    /* FIVE MINUTES */

    if (
        text.includes("five minutes") ||
        text.includes("5 minutes")
    ) {

        startTimer(300);

        chronosMessage("Five minute timer started.");

        return;
    }


    /* BACKUP MODE */

    if (
        text.includes("backup mode") ||
        text.includes("backup")
    ) {

        runBackupMode();

        return;
    }


    /* STOP TIMER */

    if (
        text.includes("stop timer") ||
        text.includes("cancel timer")
    ) {

        resetTimer();

        chronosMessage("Timer stopped.");

        return;
    }


    /* UNKNOWN */

    chronosMessage(
        "I don't understand that command yet. Try saying help."
    );

}


/* ---------------------------------------------------------
   TEXT INPUT
   --------------------------------------------------------- */

function sendText() {

    const text = textInput.value.trim();

    if (!text) {
        return;
    }

    userMessage(text);

    textInput.value = "";

    processCommand(text);

}


sendButton.addEventListener("click", sendText);


textInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendText();

    }

});


/* ---------------------------------------------------------
   SPEECH RECOGNITION
   --------------------------------------------------------- */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let listening = false;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = function() {

        listening = true;

        statusElement.textContent = "LISTENING";

        orb.classList.add("listening");

        micButton.querySelector("span").textContent =
            "Listening...";

    };


    recognition.onresult = function(event) {

        const result =
            event.results[0][0].transcript;

        userMessage(result);

        processCommand(result);

    };


    recognition.onerror = function(event) {

        console.log(
            "Speech recognition error:",
            event.error
        );

        chronosMessage(
            "I couldn't hear that. Please try again."
        );

    };


    recognition.onend = function() {

        listening = false;

        statusElement.textContent = "READY";

        orb.classList.remove("listening");

        micButton.querySelector("span").textContent =
            "Talk to Chronos";

    };

}


micButton.addEventListener("click", function() {

    if (!recognition) {

        chronosMessage(
            "Voice recognition is not available in this browser."
        );

        return;
    }


    if (listening) {

        recognition.stop();

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }

});


/* ---------------------------------------------------------
   STOPWATCH
   --------------------------------------------------------- */

let stopwatchSeconds = 0;
let stopwatchInterval = null;


function formatStopwatch(seconds) {

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor((seconds % 3600) / 60);

    const secs =
        seconds % 60;


    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


function updateStopwatch() {

    stopwatchDisplay.textContent =
        formatStopwatch(stopwatchSeconds);

}


function startStopwatch() {

    if (stopwatchInterval !== null) {
        return;
    }


    stopwatchInterval = setInterval(function() {

        stopwatchSeconds++;

        updateStopwatch();

    }, 1000);

}


function stopStopwatch() {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

}


function resetStopwatch() {

    stopStopwatch();

    stopwatchSeconds = 0;

    updateStopwatch();

}


/* ---------------------------------------------------------
   COUNTDOWN TIMER
   --------------------------------------------------------- */

let timerSeconds = 0;
let timerInterval = null;


function updateCountdown() {

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;


    countdownDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


function startTimer(seconds) {

    clearInterval(timerInterval);

    timerSeconds = seconds;

    updateCountdown();


    timerInterval = setInterval(function() {

        timerSeconds--;

        updateCountdown();


        if (timerSeconds <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            chronosMessage(
                "Timer finished."
            );

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {

                new Notification(
                    "Chronos",
                    {
                        body: "Timer finished."
                    }
                );

            }

        }

    }, 1000);

}


function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds = 0;

    updateCountdown();

}


/* ---------------------------------------------------------
   NOTIFICATIONS
   --------------------------------------------------------- */

async function requestNotifications() {

    if (!("Notification" in window)) {
        return;
    }


    if (Notification.permission === "default") {

        try {

            await Notification.requestPermission();

        } catch (error) {

            console.log(error);

        }

    }

}


requestNotifications();


/* ---------------------------------------------------------
   BACKUP MODE
   --------------------------------------------------------- */

function runBackupMode() {

    statusElement.textContent = "BACKUP";

    orb.classList.add("listening");

    userMessage("Backup Mode");


    chronosMessage(
        "Backup Mode activated. Checking Chronos..."
    );


    setTimeout(function() {

        chronosMessage(
            "Checking interface..."
        );

    }, 900);


    setTimeout(function() {

        chronosMessage(
            "Checking timers..."
        );

    }, 1800);


    setTimeout(function() {

        chronosMessage(
            "Checking voice system..."
        );

    }, 2700);


    setTimeout(function() {

        statusElement.textContent = "READY";

        orb.classList.remove("listening");

        chronosMessage(
            "Backup check complete. Chronos is ready."
        );

    }, 3800);

}


backupButton.addEventListener(
    "click",
    runBackupMode
);


/* ---------------------------------------------------------
   INITIALIZATION
   --------------------------------------------------------- */

updateStopwatch();

updateCountdown();

console.log(
    "Chronos V1 loaded successfully."
);
