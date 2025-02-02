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

const settingsbutton = document.getElementById("settingsbutton");
const sidebar = document.querySelector(".setsidebar");

window.addEventListener("load", async () => {
    const isLoggedIn = await miyu_fix_backend.login();
    if(isLoggedIn == "User not found!"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'User not found! You must register first!',
            willClose: () => {
                window.location.href = "src/login.html";
            }
        })
    }
    const getMe = await miyu_fix_backend.getMe();
    username = getMe[1].username;
    age = getMe[1].age;
    location = getMe[1].location;
    description = getMe[1].description;
    document.querySelector("#username-profile").textContent = username;
    fillForm();
    const userLocation = location;
    const usersWithSameLocation = await miyu_fix_backend.getAllUsersWithSameLocation(userLocation);
    const cardList = document.querySelector("#near-you");
    cardList.innerHTML = "";
    usersWithSameLocation.forEach(user => {
        const userLink = document.createElement("a");
        userLink.href = `src/click-profile.html?user=${user.id.toString()}`;
        const userCard = document.createElement("div");
        userCard.classList.add("card");
        const userImg = document.createElement("img");
        const imgUrl = URL.createObjectURL(new Blob([user.photos[0]]));
        userImg.src = imgUrl;
        userImg.alt = user.username + " picture";
        const userDetails = document.createElement("div");
        userDetails.classList.add("details");
        userDetails.innerHTML = `${user.username}, ${user.age}<br><span>${user.location}</span>`;
        userCard.appendChild(userImg);
        userCard.appendChild(userDetails);
        userLink.appendChild(userCard);
        cardList.appendChild(userLink);
    });
    let userInterestArray = [];
    for(let i = 0; i < getMe[1].interests.length; i++){
        userInterestArray.push(getMe[1].interests[i]);
    }
    const cardListInterest = document.querySelector("#same-hobbies");
    cardListInterest.innerHTML = "";
    const displayedUsers = new Set();
    for (const interest of userInterestArray) {
        const usersWithSameInterest = await miyu_fix_backend.getAllUsersWithSameInterest(interest);
        usersWithSameInterest.forEach(user => {
            if (!displayedUsers.has(user.id.toString())) {
                displayedUsers.add(user.id.toString());
                const userLink = document.createElement("a");
                userLink.href = `src/click-profile.html?user=${user.id.toString()}`;
                const userCard = document.createElement("div");
                userCard.classList.add("card");
                const userImg = document.createElement("img");
                const imgUrl = URL.createObjectURL(new Blob([user.photos[0]]));
                userImg.src = imgUrl;
                userImg.alt = user.username + " picture";
                const userDetails = document.createElement("div");
                userDetails.classList.add("details");
                userDetails.innerHTML = `${user.username}, ${user.age}<br><span>${user.location}</span>`;
                userCard.appendChild(userImg);
                userCard.appendChild(userDetails);
                userLink.appendChild(userCard);
                cardListInterest.appendChild(userLink);
            }
        });
    }
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