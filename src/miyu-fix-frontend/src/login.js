import { miyu_fix_backend } from "../../declarations/miyu-fix-backend";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
let authClient;
async function initAuth(){
    authClient = await AuthClient.create();
    console.log("Auth client created");
    const isAuthenticated = await authClient.isAuthenticated();
    console.log(isAuthenticated);
    // if (!isAuthenticated) {
    //     window.location.href = "login.html";
    // }else {
    //     window.location.href = "../index.html";
    // }
}

async function login(){
    if(!authClient){
        authClient = await AuthClient.create();
    }
    await authClient.login({
        onSuccess: async () => {
            console.log("Authenticated successfully");
            window.location.href = "../index.html";
        },
        onError: (err) => {
            console.error(err);
        },
    })
    await miyu_fix_backend.login();
}
window.addEventListener("load", async () => {
    await initAuth();
});

document.querySelector("#login").addEventListener("click", async () => {
    await login();
});

window.addEventListener("load", () => {
    const registerForm = document.querySelector("form"); 
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const email = document.querySelector("#email").value;
        const name = document.querySelector("#name").value;
        const location = document.querySelector("#location").value;
        const description = document.querySelector("#description").value;
        const interest = document.querySelector("#interest").value;

        console.log("Email: ", email);
        console.log("Name: ", name);
        console.log("Location: ", location);
        console.log("Description: ", description);
        console.log("Interest: ", interest);

        // await miyu_fix_backend.register(email, name, location, description, interest);
        // Redirect setelah berhasil registrasi (jika perlu)
        // authClient = await AuthClient.create();
        window.location.href = "../index.html";
    });
});
