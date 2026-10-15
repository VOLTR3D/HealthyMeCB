
const foodFile = document.getElementById("foodFile");

const cameraBtn = document.getElementById("cameraBtn");
const uploadBtn = document.getElementById("uploadBtn");
const captureBtn = document.getElementById("captureBtn");
const closeCameraBtn = document.getElementById("closeCameraBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const removeBtn = document.getElementById("removeBtn");

const cameraBox = document.getElementById("cameraBox");
const cameraVideo = document.getElementById("cameraVideo");

const previewImage = document.getElementById("previewImage");
const emptyPreview = document.getElementById("emptyPreview");

const resultImage = document.getElementById("resultImage");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const resultCaption = document.getElementById("resultCaption");
const statusMessage = document.getElementById("statusMessage");

const calories = document.getElementById("calories");
const protein = document.getElementById("protein");
const carbs = document.getElementById("carbs");
const fat = document.getElementById("fat");

const fiber = document.getElementById("fiber");
const vitamins = document.getElementById("vitamins");
const minerals = document.getElementById("minerals");
const water = document.getElementById("water");
const insights = document.getElementById("insights");

let selectedFile = null;
let previewURL = null;
let cameraStream = null;


// Open the gallery
uploadBtn.addEventListener("click", function () {
    foodFile.click();
});


// Open the live camera
cameraBtn.addEventListener("click", async function () {
    await openCamera();
});


// Start camera stream
async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusMessage.textContent =
            "Camera is unavailable. Use HTTPS or localhost and a supported browser.";
        return;
    }

    try {
        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        cameraVideo.srcObject = cameraStream;
        cameraBox.hidden = false;

        cameraBtn.disabled = true;
        uploadBtn.disabled = true;

        statusMessage.textContent =
            "Camera is ready. Point it at your food and capture a photo.";

    } catch (error) {
        console.error("Camera error:", error);

        statusMessage.textContent =
            "Could not open the camera. Allow camera permission or use Upload Image.";
    }
}


// Capture a photo from the live video
captureBtn.addEventListener("click", function () {
    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
        statusMessage.textContent = "Please wait for the camera to load.";
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(cameraVideo, 0, 0);

    canvas.toBlob(function (blob) {
        if (!blob) {
            statusMessage.textContent = "Could not capture the photo. Try again.";
            return;
        }

        selectedFile = new File(
            [blob],
            "food-photo.jpg",
            { type: "image/jpeg" }
        );

        stopCamera();
        cameraBox.hidden = true;

        cameraBtn.disabled = false;
        uploadBtn.disabled = false;

        showImage(selectedFile);

    }, "image/jpeg", 0.92);
});


// Close the camera
closeCameraBtn.addEventListener("click", function () {
    stopCamera();

    cameraBox.hidden = true;
    cameraBtn.disabled = false;
    uploadBtn.disabled = false;

    statusMessage.textContent = "Camera closed.";
});


// Stop camera tracks
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    cameraVideo.srcObject = null;
}


// Handle image selected from the gallery
foodFile.addEventListener("change", function () {
    const file = foodFile.files[0];

    if (file) {
        handleImage(file);
    }
});


// Validate the selected image
function handleImage(file) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        statusMessage.textContent =
            "Please select a JPG, PNG, or WEBP image.";

        foodFile.value = "";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        statusMessage.textContent =
            "Image is too large. Please choose an image under 10 MB.";

        foodFile.value = "";
        return;
    }

    selectedFile = file;
    showImage(file);
}


// Display the image in both preview areas
function showImage(file) {
    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    previewURL = URL.createObjectURL(file);

    previewImage.src = previewURL;
    previewImage.hidden = false;
    emptyPreview.hidden = true;

    resultImage.src = previewURL;
    resultImage.hidden = false;
    resultPlaceholder.hidden = true;

    resultCaption.textContent = "Image selected — ready for analysis";

    analyzeBtn.disabled = false;
    removeBtn.hidden = false;

    resetResults();

    statusMessage.textContent =
        "Photo ready. Click Analyze My Food to continue.";
}


// Reset nutrition values
function resetResults() {
    calories.textContent = "—";
    protein.textContent = "—";
    carbs.textContent = "—";
    fat.textContent = "—";

    fiber.textContent = "—";
    vitamins.textContent = "—";
    minerals.textContent = "—";
    water.textContent = "—";

    insights.textContent =
        "Nutrition analysis has not been completed yet.";
}


// Remove selected image
removeBtn.addEventListener("click", function () {
    selectedFile = null;

    stopCamera();

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    previewImage.removeAttribute("src");
    previewImage.hidden = true;
    emptyPreview.hidden = false;

    resultImage.removeAttribute("src");
    resultImage.hidden = true;
    resultPlaceholder.hidden = false;

    resultCaption.textContent = "Your scanned food will appear here";

    analyzeBtn.disabled = true;
    removeBtn.hidden = true;

    foodFile.value = "";

    resetResults();

    statusMessage.textContent = "Choose a photo to start a new food scan.";
});


// Analyze button
analyzeBtn.addEventListener("click", function () {
    if (!selectedFile) {
        statusMessage.textContent =
            "Please take or upload a food photo first.";
        return;
    }

    statusMessage.textContent =
        "Photo selected. Connect your Spring Boot backend and food-analysis API to calculate nutrition.";

    resultCaption.textContent = "Ready for food analysis";

    insights.textContent =
        "Real nutrition results will appear here after the food-analysis service is connected.";
});


// Stop camera if the page is closed or hidden
window.addEventListener("pagehide", stopCamera);
