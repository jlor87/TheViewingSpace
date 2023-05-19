let usernameCorrect = false;
let emailValid = false;
let passwordCorrect = false;
let confirmPasswordCorrect = false;
let ageAbove13 = false;
let readTOS = false;
let allConditionsPass = false;
let globalPassword = "";

function alphaNumCount(string){
    var asciiNum, i, count;
    count = 0;
    for(i = 0; i < string.length; i++){
        asciiNum = string.charCodeAt(i);
        if ((asciiNum > 47 && asciiNum < 58) ||
            (asciiNum > 64 && asciiNum < 91) ||
            (asciiNum > 96 && asciiNum < 123)) { 
            count++;
        }
    }
    return count;
}

function isAlpha(char){
    var asciiNum = char.charCodeAt(0);
    if((asciiNum > 64 && asciiNum < 91) || (asciiNum > 96 && asciiNum < 123)) {
        return true;
    } else {
        return false;
    }
}

document.getElementById("username").addEventListener('input', function(event){
    let userInput = event.currentTarget;
    let username = userInput.value;
    let firstChar = username.charAt(0);

    var usernameStatus = document.getElementById("username");
    if(isAlpha(firstChar) && alphaNumCount(username) >= 3) {
        usernameCorrect = true;
        usernameStatus.style.outline = "2px solid #66FF00";
    } else {
        usernameStatus.style.outline = "2px solid red";
    }
})

function passwordCheck(password){
    let uppercaseChar = false;
    let number = false;
    let specialChar = false;
    if(password.length < 8){
        return false;
    }
    for(i = 0; i < password.length; i++){
        if(password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90){
            uppercaseChar = true;
        }
        if(password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57){
            number = true;
        }
        if(password.charCodeAt(i) == 33 ||
            password.charCodeAt(i) == 35 ||
            password.charCodeAt(i) == 36 ||
            password.charCodeAt(i) == 42 ||
            password.charCodeAt(i) == 43 ||
            password.charCodeAt(i) == 45 ||
            password.charCodeAt(i) == 47 ||
            password.charCodeAt(i) == 64 ||
            password.charCodeAt(i) == 91 ||
            password.charCodeAt(i) == 93 ||
            password.charCodeAt(i) == 94 ||
            password.charCodeAt(i) == 126){
                specialChar = true;
        }
    }
    if(uppercaseChar && number && specialChar){
        return true;
    } else {
        return false;
    }
}

document.getElementById("password").addEventListener('input', function(event){
    let userInput = event.currentTarget;
    let password = userInput.value;

    var passwordStatus = document.getElementById("password");
    if(passwordCheck(password)){
        globalPassword = password;
        console.log(globalPassword);
        passwordCorrect = true;
        passwordStatus.style.outline = "2px solid #66FF00";
    } else {
        passwordStatus.style.outline = "2px solid red";
    }
})


document.getElementById("password2").addEventListener('input', function(event){
    let userInput = event.currentTarget;
    let confirmPassword = userInput.value;

    var matchingPassword = document.getElementById("password2");
    if(confirmPassword == globalPassword){
        confirmPasswordCorrect = true;
        matchingPassword.style.outline = "2px solid #66FF00";
    } else {
        matchingPassword.style.outline = "2px solid red";
    }
})


function validateEmail(email){
    var format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(email.match(format)){
        return true;
    }
    else{
        return false;
    }
}

document.getElementById("email").addEventListener('input', function(event){
    let userInput = event.currentTarget;
    let emailInput = userInput.value;
    let valid = validateEmail(emailInput);

    var emailStatus = document.getElementById("email");
    if(valid){
        emailValid = true;
        emailStatus.style.outline = "2px solid #66FF00";
    } else {
        emailValid = false;
        emailStatus.style.outline = "2px solid red";
    }
})


document.getElementById("ageCheckBox").addEventListener('change', function(ev) {
    let checkAge = ev.currentTarget;
    if(checkAge.checked){
            ageAbove13 = true;
    } else {
            ageAbove13 = false;
    }
});

document.getElementById("tosCheckBox").addEventListener('change', function(ev) {
    let agreeWithTOS = ev.currentTarget;
    if(agreeWithTOS.checked){
            readTOS = true;
    } else {
            readTOS = false;
    }
});