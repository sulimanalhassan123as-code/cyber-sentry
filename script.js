const eyes = document.querySelectorAll('.iris');
const statusText = document.getElementById('status');
const overlay = document.getElementById('overlay');
const flashbang = document.getElementById('flashbang');
const mugshotBox = document.getElementById('mugshot-container');
const intruderPhoto = document.getElementById('intruder-photo');

// CAMERA
const video = document.getElementById('camera-feed');
const canvas = document.getElementById('camera-sensor');
let cameraActive = false;

let currentMode = 'eyes';
let isBreach = false;

// SOUNDS
const sounds = {
    eyes: document.getElementById('sound-siren'),
    thunder: document.getElementById('sound-thunder'),
    gun: document.getElementById('sound-gun'),
    shutter: document.getElementById('sound-shutter')
};

// 1. ACTIVATE CAMERA
window.enableCamera = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        video.srcObject = stream;
        video.play();
        cameraActive = true;
        document.querySelector('.btn-cam').innerText = "CAMERA ARMED ✅";
        document.querySelector('.btn-cam').style.background = "green";
    } catch (err) {
        alert("Camera permission denied!");
    }
}

// 2. MODE SWITCHER & AUDIO UNLOCKER (The Fix)
window.setMode = function(mode) {
    currentMode = mode;
    
    // UI Updates
    document.querySelectorAll('.mode-container').forEach(el => el.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    statusText.innerText = "SYSTEM ARMED: " + mode.toUpperCase();
    statusText.style.color = "white";

    // --- THE AUDIO FIX ---
    // We play the sound for 0.01 seconds and pause it.
    // This tells the browser: "The user allowed this sound!"
    const s = sounds[mode];
    if(s) {
        s.muted = true; // Mute so we don't hear it yet
        s.play().then(() => {
            s.pause();
            s.currentTime = 0;
            s.muted = false; // Unmute for later
        }).catch(e => console.log("Audio waiting for interaction"));
    }
}

// 3. GYROSCOPE
window.addEventListener('deviceorientation', (e) => {
    if (isBreach) return;
    const x = Math.min(Math.max(e.gamma, -40), 40); 
    const y = Math.min(Math.max(e.beta - 45, -40), 40);
    eyes.forEach(eye => { eye.style.transform = `translate(${x}px, ${y}px)`; });
});

// 4. TRIGGER TRAP
document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') return;

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission();
    }

    if (!isBreach) {
        startAlarm();
    }
});

function startAlarm() {
    isBreach = true;
    statusText.innerText = "INTRUDER DETECTED!";
    statusText.style.color = "red";

    // A. CAPTURE PHOTO
    if (cameraActive) takeMugshot();

    // B. PLAY SOUND (Now guaranteed to work)
    const sound = sounds[currentMode];
    if (sound) {
        sound.currentTime = 0; 
        sound.volume = 1.0;
        sound.play().catch(e => console.log("Browser blocked audio"));
    }

    // C. VIBRATE
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);

    // D. VISUALS
    if (currentMode === 'thunder') {
        let flashes = 0;
        const interval = setInterval(() => {
            flashbang.style.opacity = '1';
            setTimeout(() => { flashbang.style.opacity = '0'; }, 50);
            flashes++;
            if (flashes >= 5) clearInterval(interval);
        }, 300);
    } 
    else {
        overlay.style.animation = "burn 0.2s infinite";
        overlay.style.opacity = '0.5';
    }

    setTimeout(resetSystem, 6000);
}

function takeMugshot() {
    sounds.shutter.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    intruderPhoto.src = canvas.toDataURL("image/png");
    mugshotBox.classList.add('visible');
}

function resetSystem() {
    isBreach = false;
    statusText.innerText = "SYSTEM RE-ARMED";
    statusText.style.color = "white";
    overlay.style.opacity = '0';
    overlay.style.animation = "none";
    mugshotBox.classList.remove('visible');
}
