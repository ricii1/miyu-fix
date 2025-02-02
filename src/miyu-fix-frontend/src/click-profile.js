import { Principal } from "@dfinity/principal";
import { miyu_fix_backend } from "../../declarations/miyu-fix-backend";
import Swal from 'sweetalert2'

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

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user");

function isValidPrincipal(principalStr) {
    try {
        Principal.fromText(principalStr);
        return true; 
    } catch (error) {
        return false;
    }
}

window.addEventListener("load", async () => {
    const getMe = await miyu_fix_backend.getMe();
    username = getMe[1].username;
    age = getMe[1].age;
    location = getMe[1].location;
    description = getMe[1].description;
    if(getMe[1].connections.toString() == userId){
        document.querySelector("#match-button").style.display = "none";
        document.querySelector("#remove-button").style.visibility = "visible";
    }
    document.querySelector("#profile-name").textContent = username;
    fillForm();
    if(!isValidPrincipal(userId)){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid user ID!',
            willClose: () => {
                window.location.href = "../index.html";
            }
        })
    }
    const response = await miyu_fix_backend.getUserDetail(Principal.fromText(userId));
    const res = response[0];
    if(res != "Success Getting User"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'User not found!',
            willClose: () => {
                window.location.href = "../index.html";
            }
        })
    }
    const profile = response[1];
    document.querySelector(".profile-details .profile-name").textContent = `${profile.username}, ${profile.age}`;
    document.querySelector(".profile-details .profile-location").textContent = profile.location;
    document.querySelector(".profile-details .profile-description").textContent = profile.description;
    // console.log(profile.connections);
    if(profile.connections.length == 0){
        document.querySelector(".profile-details .status-badge").textContent = "SINGLE";
    }else {
        document.querySelector(".profile-details .status-badge").textContent = "CONNECTED";
    }
    const interestsContainer = document.querySelector(".interests-container");
    interestsContainer.innerHTML = "";
    profile.interests.forEach(interest => {
        const interestTag = document.createElement("div");
        interestTag.className = "interest-tag";
        interestTag.textContent = interest;
        interestsContainer.appendChild(interestTag);
    });

    const gallery = document.querySelector("#gallery");
    gallery.innerHTML = ""; // Clear existing content

    const photos = profile.photos;

    let cardList = null;
    photos.forEach((photo, index) => {
        const url = URL.createObjectURL(new Blob([photo]));
        if(index == 0){
            document.querySelector("#profile-image").src = url;
        }else {
            if ((index-1) % 4 === 0 || !cardList) {
                cardList = document.createElement("div");
                cardList.className = "card-list";
                gallery.appendChild(cardList);
            }
            const card = document.createElement("div");
            card.className = "card";
            const img = document.createElement("img");
            img.src = url;
            img.alt = `Photo ${index + 1}`;
            card.appendChild(img);
            cardList.appendChild(card);
        }
    });
});

document.querySelector("#match-button").addEventListener("click", async (event) => {
    event.preventDefault();
    event.target.disabled = true;
    const response = await miyu_fix_backend.sendConnReq(Principal.fromText(userId));
    if(response.startsWith("Success")){
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Connection request sent successfully!'
        });
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response
        });
    }
    event.target.disabled = false;
});

document.querySelector("#remove-button").addEventListener("click", async (event) => {
    event.preventDefault();
    event.target.disabled = true;
    const response = await miyu_fix_backend.deleteNowConnection(Principal.fromText(userId));
    if(response.startsWith("Error")){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: response
        });
    }else{
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response,
        });
    }
    event.target.disabled = false;
});

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
    console.log("Name:", name);
    console.log("Age:", age);
    console.log("City:", city);
    console.log("Description:", description);
    console.log("Interests:", interests);
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

// location API
async function fetchCountryLookup() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) {
            throw new Error("Failed to fetch country data");
        }

        const countries = await response.json();

        const countryLookup = {};
        countries.forEach((country) => {
            if (country.cca2 && country.name && country.name.common) {
                countryLookup[country.cca2] = country.name.common;
            }
        });

        return countryLookup; 
    } catch (error) {
        console.error("Error fetching country data:", error);
        return null;
    }
}

async function fetchUserLocation(countryLookup) {
    try {
        const response = await fetch("https://ipinfo.io/json?token=e7b49e2b2e8db0"); 
        if (!response.ok) {
            throw new Error("Failed to fetch user location");
        }

        const data = await response.json();

        const countryCode = data.country || "Unknown Country";
        const city = data.city || "Unknown City";

        const country = countryLookup[countryCode] || countryCode;

        const userLocation = document.getElementById("user-location");
        userLocation.textContent = `${country}, ${city}`;
    } catch (error) {
        console.error("Error fetching user location:", error);

        const userLocation = document.getElementById("user-location");
        userLocation.textContent = "Location not available";
    }
}

document.getElementById("fetch-location-link").addEventListener("click", async function (event) {
    event.preventDefault(); 

    const countryLookup = await fetchCountryLookup(); 
    if (countryLookup) {
        await fetchUserLocation(countryLookup); 
    } else {
        console.error("Failed to load country data. Cannot display location.");
    }
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
