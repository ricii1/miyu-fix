import { Principal } from "@dfinity/principal";
import { miyu_fix_backend } from "../../declarations/miyu-fix-backend";
var username = "";
var age = "";
var location = "";
var description = "";
function fillForm(){
    document.querySelector(".cpdname input").value = username;
    document.querySelector(".cpdage input").value = age;
    document.querySelector(".cpdcity input").value = location;
    document.querySelector(".cpddesc input").value = description;    
}

window.addEventListener("load", async () => {
    try {
        const isLoggedIn = await miyu_fix_backend.login();
        if (isLoggedIn === "User not found!") {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'User not found! You must register first!',
                willClose: () => window.location.href = "src/login.html"
            });
            return;
        }

        const getMe = await miyu_fix_backend.getMe();
        const { username, age, location, description } = getMe[1];
        fillForm();

        const allChats = await miyu_fix_backend.getChats();
        let idCaller = (await miyu_fix_backend.getCaller()).toString();
        let chatGroups = {};

        for (const chat of allChats) {
            let partner;
            if(chat.from == idCaller || chat.to == idCaller){
                if(chat.from == idCaller){
                    partner = chat.to;
                }else {
                    partner = chat.from;
                }
            }
            let partnerData = await miyu_fix_backend.getUserDetail(partner);
            let partnerDetails = partnerData[1];
            if (!chatGroups[[partnerDetails.username]]) chatGroups[[partnerDetails.username]] = [];
            chatGroups[[partnerDetails.username]].push({ ...chat, partnerDetails });
        }

        Object.values(chatGroups).forEach(chats => 
            chats.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
        );
        updateChatWindow(chatGroups, idCaller);
        updateContactList(chatGroups);
    } catch (error) {
        console.error("Error loading chats:", error);
    }
});

function updateContactList(chatGroups) {
    const contactList = document.querySelector(".contact-list");
    contactList.innerHTML = "";

    const totalConversations = Object.keys(chatGroups).length;
    document.querySelector(".contact-header span").textContent = `(${totalConversations}) conversations detected`;

    Object.keys(chatGroups).forEach(partner => {
        let lastMessage = chatGroups[partner][chatGroups[partner].length - 1];
        let chatPreview = lastMessage.content.length > 20 ? lastMessage.content.substring(0, 20) + "..." : lastMessage.content;
        let unreadCount = chatGroups[partner].length;

        let partnerPhoto = chatGroups[partner][0].partnerDetails.photos[0];
        const url = URL.createObjectURL(new Blob([partnerPhoto]));
        partnerPhoto = url;
        let chatButton = document.createElement("button");
        chatButton.id = `chat-${partner}`;
        chatButton.innerHTML = `
            <div class="message-card">
                <div class="cl-profile"><img src="${partnerPhoto}" alt="${partner}"></div>
                <div class="column">
                    <div class="cl-name">${partner}</div>
                    <div class="cl-text">${chatPreview}</div>
                </div>
                <div class="column-right">
                    <div class="cl-notif">${unreadCount}</div>
                </div>
            </div>
        `;
        chatButton.addEventListener("click", () => handleChatClick(chatButton.id));
        contactList.appendChild(chatButton);
    });
}

function updateChatWindow(chatGroups, idCaller) {
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = "";

    Object.keys(chatGroups).forEach(partner => {
        let chatContainer = document.createElement("div");
        chatContainer.classList.add("personchat");
        chatContainer.dataset.chat = `chat-${partner}`;
        let partnerPhoto = chatGroups[partner][0].partnerDetails.photos[0];
        let partnerID = chatGroups[partner][0].partnerDetails.id.toString();
        const url = URL.createObjectURL(new Blob([partnerPhoto]));
        partnerPhoto = url;

        chatContainer.innerHTML = `
            <header class="header">
                <div class="from">
                    <a href="click-profile.html?user=${partnerID}">
                        <div class="cl-profile"><img src="${partnerPhoto}" alt="${partner}"></div>
                    </a>
                    <div class="column">
                        <div class="cl-name">${partner}</div>
                    </div>
                </div>
            </header>
            <section class="chatzone">
                <div class="datetime">Sat, 25 Jan 2025</div>
                ${chatGroups[partner].map(message => `
                    <div class="${message.from == idCaller ? 'receiver' : 'sender'}">
                        <div class="chatbox">${message.content}</div>
                        <div class="chattime">${new Date(Number(message.timestamp / 1_000_000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                `).join('')}
            </section>
            <form class="chat-form">
                <div class="typing">
                    <label for="cam"><img src="/camicon.png" class="typing-label"></label>
                    <input id="cam" type="file" accept="image/*">
                    <input class="text message-input" id="filename" type="text" placeholder="Type message here...">
                    <div class="submit">
                        <button type="submit"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                </div>
            </form>
        `;
        const form = chatContainer.querySelector(".chat-form");
        const input = chatContainer.querySelector(".message-input");
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const messageText = input.value.trim();
            if (messageText) {
                await miyu_fix_backend.sendMessage(Principal.fromText(partnerID), messageText);
                input.value = "";
                window.location.reload(); // Reload the window after sending the message
            }
        });
        mainContent.appendChild(chatContainer);
    });
}

function handleChatClick(chatId) {
    document.querySelectorAll(".personchat").forEach(chat => chat.style.display = "none");
    const activeChat = document.querySelector(`.personchat[data-chat="${chatId}"]`);
    console.log(activeChat);
    if (activeChat) activeChat.style.display = "block";

    const chatButton = document.getElementById(chatId);
    if (chatButton) {
        const messageCard = chatButton.querySelector(".message-card");
        if (messageCard) {
            messageCard.classList.replace("message-card", "message-card-read");
            const notif = messageCard.querySelector(".cl-notif");
            if (notif) notif.style.display = "none";
        }
    }
}

document.querySelector("#save").addEventListener("click", async (event) => {
    event.preventDefault();
    document.querySelector("#save").disabled = true;
    const name = document.querySelector(".cpdname input").value;
    const age = parseInt(document.querySelector(".cpdage input").value);
    const city = document.querySelector(".cpdcity input").value;
    const description = document.querySelector(".cpddesc input").value;
    const interests = document.querySelector("#selected-interests").value.split(", ");
    const file = document.querySelector("#fileUpload").files[0];
    const response = await fetch(file);
    const updateProfileRes = await miyu_fix_backend.updateProfile([name], [], [city], [age], [description]);
    if(updateProfileRes != "Profile updated successfully!"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Profile update failed!',
        });
    }
    const updateInterestRes = await miyu_fix_backend.updateInterests(interests);
    if(updateInterestRes != "Interests updated successfully!"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Interests update failed!',
        });
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        const addImage = await miyu_fix_backend.addImage(uint8Array);
        if(addImage != "Image added successfully!"){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Image upload failed!',
            });
        }
    };
    reader.readAsArrayBuffer(file); 
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Profile updated successfully!'
    });
});

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


