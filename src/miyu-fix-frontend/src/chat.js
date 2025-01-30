const settingsbutton = document.getElementById("settingsbutton");
const sidebar = document.querySelector(".setsidebar");

settingsbutton.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

const accprof = document.getElementById("accprof");
const setsidebar = document.querySelector(".setAP");

accprof.addEventListener("click", () => {
    setsidebar.classList.toggle("active");
});

const accnotif = document.getElementById("accnotif");
const setsidebars = document.querySelector(".setnotif");

accnotif.addEventListener("click", () => {
    setsidebars.classList.toggle("active");
});

const closes = document.getElementById("close-notif");
closes.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    setsidebars.classList.toggle("active");
});

const closess = document.getElementById("close-editprof");
closess.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    setsidebar.classList.toggle("active");
});

// change profile logic
const profileImg = document.getElementById("profile-img");
    const imageInput = document.getElementById("image-input");
    const cropperImage = document.getElementById("cropper-image");
    const cropperModal = document.getElementById("cropper-modal");
    const cropButton = document.getElementById("crop-button");

    let cropper;

    document.getElementById("change-pp").addEventListener("click", function (event) {
        event.preventDefault(); 
        imageInput.click(); 
    });

    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                cropperModal.style.display = 'block';
                cropperImage.src = e.target.result;

                cropper = new Cropper(cropperImage, {
                    aspectRatio: 1, 
                    viewMode: 2,   
                    autoCropArea: 0.8,
                    ready: function () {
                        console.log("Cropper is ready!");
                    }
                });
            };

            reader.readAsDataURL(file);
        }
    });

cropButton.addEventListener("click", function(event) {
    event.preventDefault(); 

    if (cropper) {
        const croppedDataUrl = cropper.getCroppedCanvas({ width: 100, height: 100 }).toDataURL();

        console.log("Cropped Image Data URL: ", croppedDataUrl);

        localStorage.setItem("profilePicture", croppedDataUrl);

        profileImg.src = croppedDataUrl;

        cropperModal.style.display = 'none';
        cropper.destroy();
    }
});

//chose interest
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".interest-btn");
    const selectedInterests = new Set();
    const warning = document.getElementById("interest-warning");
    const hiddenInput = document.getElementById("selected-interests");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const value = this.getAttribute("data-value");

            if (selectedInterests.has(value)) {
                selectedInterests.delete(value);
                this.classList.remove("selected");
            } else {
                if (selectedInterests.size >= 5) {
                    warning.style.display = "block";
                    return;
                }
                selectedInterests.add(value);
                this.classList.add("selected");
            }

            warning.style.display = selectedInterests.size >= 5 ? "block" : "none";
            hiddenInput.value = Array.from(selectedInterests).join(", ");
        });
    });
});

//upload drag drop
const dropArea = document.querySelector(".upload-box");
const fileInput = document.getElementById("fileUpload");

fileInput.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
});

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "#c20000";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "rgba(0, 0, 0, 0.2)";
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "rgba(0, 0, 0, 0.2)";
    
    let files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFile(file) {
    alert(`File Uploaded: ${file.name}`);
}

//upload image di chat//
const camInput = document.getElementById('cam');
const textInput = document.getElementById('filename');

camInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        textInput.value = file.name;
        textInput.readOnly = true; 
    } else {
        textInput.value = '';
        textInput.readOnly = false; 
    }
});

textInput.addEventListener('input', () => {
    if (textInput.value !== '') {
        camInput.value = '';
    }
});

//open chat logic
document.addEventListener("DOMContentLoaded", function () {
    const chatButtons = document.querySelectorAll(".contact-list button");

    chatButtons.forEach(button => {
        button.addEventListener("click", function () {
            const chatId = this.id;

            // Ubah tampilan pesan menjadi "dibaca"
            const messageCard = this.querySelector(".message-card");
            if (messageCard) {
                messageCard.classList.remove("message-card");
                messageCard.classList.add("message-card-read");

                // Sembunyikan notifikasi
                const notif = messageCard.querySelector(".cl-notif");
                if (notif) {
                    notif.style.display = "none";
                }
            }

            // Sembunyikan semua "personchat"
            document.querySelectorAll(".personchat").forEach(chat => {
                chat.style.display = "none";
            });

            // Tampilkan "personchat" yang sesuai
            const activeChat = document.querySelector(`.personchat[data-chat="${chatId}"]`);
            if (activeChat) {
                activeChat.style.display = "block";
            }
        });
    });
});


