import { miyu_fix_backend } from "../../declarations/miyu-fix-backend";
import Swal from 'sweetalert2'

document.querySelector("#login").addEventListener("click", async (event) => {
    event.preventDefault();
    document.querySelector("#login").disabled = true;
    let res = await miyu_fix_backend.login();
    if(res == "User not found!"){
        console.log("masuk")
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'User not found! You must register first!',
        });
    }else {
        window.location.href = "../index.html";
    }
    document.querySelector("#login").disabled = false;
});

document.querySelector("#register").addEventListener("click", async (event) => {
    event.preventDefault();
    document.querySelector("#register").disabled = true;
    const email = document.querySelector("#email").value;
    const name = document.querySelector("#name").value;
    const location = document.querySelector("#location").value;
    const description = document.querySelector("#description").value;
    const interest = document.querySelector("#interest").value;
    const age = parseInt(document.querySelector("#age").value);

    let registerResponse = await miyu_fix_backend.createAccount(name, email, age, location, description, interest);
    if(registerResponse == "User with this ID already exists!"){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'User with this ID already exists!',
        });
    }else {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: registerResponse
        })
    }
    document.querySelector("#register").disabled = false;
});
