var express = require('express');
var router = express.Router();
var db = require('../conf/database.js');

// Global variables
global.loggedIn = false;
global.loginUsername = "unset";
global.loginEmail = "unset";

//var bcrypt = require('bcrypt');

// localhost:3000/users/registration
router.post('/registration', async function(req, res, next){
  console.log(req.body);
  var {username, email, password, confirmPassword, ageCheckBox, tosCheckBox} = req.body;

  // ---------- input validation, copied from assignment4 ----------
  let usernameCorrect = false;
  let emailValid = false;
  let passwordCorrect = false;
  let confirmPasswordCorrect = false;
  let ageAbove13 = false;
  let readTOS = false;
  let allConditionsPass = false;

      // Check username
      let firstChar = username.charAt(0);
      if(isAlpha(firstChar) && alphaNumCount(username) >= 3) {
          usernameCorrect = true;
          console.log('Username is valid');
      } else {
          console.log('Username must start with a letter and contain 3 or more alphanumeric characters.');
          //return res.redirect('/registration');
      }

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

      // Check password
      if(passwordCheck(password)){
        console.log("Valid password");
        passwordCorrect = true;
      } else {
          console.log("Invalid password. Password must contain 8 or more characters, at least 1 uppercase letter, 1 number, and 1 of the following special characters: / * - + ! @ # $ ^ & ~ [ ]");
          //return res.redirect('/registration');
      }
 
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

      // Check confirm password
      if(confirmPassword == password){
          console.log("Passwords match.");
          confirmPasswordCorrect = true;
      } else {
          console.log("Passwords must match!");
          //return res.redirect('/registration');
      }

      // check email
      let valid = validateEmail(email);
      if(valid){
          console.log("Valid email");
          emailValid = true;
      } else {
          console.log("Invalid email");
          emailValid = false;
          //return res.redirect('/registration');
      }

      function validateEmail(email){
          var format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          if(email.match(format)){
              return true;
          }
          else{
              return false;
          }
      }

      // Check if age 13+
      if(ageCheckBox == 'on'){
          ageAbove13 = true;
          console.log("User is above 13.");
      } else {
          ageAbove13 = false;
          //return res.redirect('/registration');
      }

      // Check if user has read TOS
      if(tosCheckBox == 'on'){
          readTOS = true;
          console.log("User has read TOS.");
      } else {
          readTOS = false;
          //return res.redirect('/registration');
      }

      // if all conditions meet, go on
      if (usernameCorrect && emailValid && 
          passwordCorrect && confirmPasswordCorrect &&
          ageAbove13 && readTOS){
              allConditionsPass = true;
              console.log("All conditions true.");
      }

  // --------- end input validation ---------

  //For testing purposes:
  allConditionsPass = true;
  if(allConditionsPass){
    try{
      // Checking username uniqueness
      var [rows, fields] = await db.execute(`SELECT id FROM users WHERE username=?;`, [username]); // don't use username="username" or else that leads to SQL injection
      console.log(rows);
      if(rows && rows.length > 0){
        console.log("Username already exists!");
        return res.redirect('/registration');
      }

      // Checking email uniqueness
      var [rows, fields] = await db.execute(`SELECT email FROM users WHERE email=?;`, [email]); // don't use username="username" or else that leads to SQL injection
      if(rows && rows.length > 0){
        console.log("Email already in use!");
        return res.redirect('/registration');
      }

      // Insert
      var [resultObject, fields] = await db.execute(`INSERT INTO users (username, email, password) VALUE (?,?,?);`, [username, email, password]);

      // Respond
      if(resultObject && resultObject.affectedRows == 1){
        return res.redirect('/login');
      } else{
        return res.redirect('/registration');
      }

    // Error
    } catch(error){
      console.log('we caught an error');
    }

  } else{
    console.log('User input does not meet requirements. Please try again.');
    return res.redirect('/registration');
  }

});



router.post('/login', async function(req, res, next){
  console.log(req.body);
  var {username, password} = req.body;
  //var hashedPassword = bcrypt.hash(password,3);

  try{
    var [rows, fields] = await db.execute(`SELECT * FROM users WHERE username = ? AND password = ?;`, [username, password]);
    var obj = rows[0];

    if(rows.length != 0){
        /*var passwordsMatch = await bcrypt.compare(password, user.password);
        if(passwordsMatch){
          console.log("Login successful!");
        return res.redirect('/');
        }*/
        loggedIn = true;
        loginUsername = obj.username;
        loginEmail = obj.email;
        console.log(loggedIn);
        return res.redirect('/');
    } else{
        console.log("Username or password incorrect!");
        return res.redirect('/login');
    }
  } catch(error){
    console.log('we caught an error');
  }
});

module.exports = router;
