var validator = require('validator');

module.exports = {
    usernameCheck: function(req, res, next){
        var {username} = req.body;
        username = username.trim();
        if(validator.isLength(username, {min: 3})){
            req.flash("error", 'Username must be at least 3 or more characters!');
        }

        if(/^[a-zA-Z]/.test(username.charAt(0))){
            req.flash("error", 'Username must start with a letter!');
        }

        if(req.session.flash.error > 0){
            req.session.save(function(err){
                if(err) next(err);
                res.redirect('/register');
                return false;
            })
        } else {
            return true;
        }
    },

    emailCheck: function(req, res, next){
        var {email} = req.body;
        var format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if(email.match(format)){
            return true;
        }
        else{
            req.flash("error", `Email is invalid!`);
            return false;
        }
    },

    passwordCheck: function(req, res, next){
        var {password} = req.body;
        if(passwordCheck(password)){
            passwordCorrect = true;
          } else {
              req.flash("error", `Password must contain 8 or more characters, at least 1 uppercase letter, 1 number, and 1 of the following special characters: / * - + ! @ # $ ^ & ~ [ ]`);
              return false;
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
    },

    confirmPasswordCheck: function(req, res, next){
        var {confirmPassword} = req.body;
        if(confirmPassword == password){
            confirmPasswordCorrect = true;
        } else {
            req.flash("error", `Passwords must match!`);
            return false;
        }
    },

    tosCheck: function(req, res, next){
        var {tosCheckBox} = req.body;
        if(tosCheckBox == 'on'){
            return true;
        } else {
            req.flash("error", `You have not checked that you've read the Terms of Service!`);
            return false;
        }
    },

    ageCheck: function(req, res, next){
        var {ageCheckBox} = req.body;
        if(ageCheckBox == 'on'){
            return true;
        } else {
            req.flash("error", `You have not checked that you are above the age of 13!`);
            return false;
        }
    },

    isUsernameUniqueCheck: async function(req, res, next){
        try{
            var [rows, fields] = await db.execute(`SELECT id FROM users WHERE username=?;`, [username]); // don't use username="username" or else that leads to SQL injection
            console.log(rows);
            if(rows && rows.length > 0){
                req.flash("error", `Username already exists!`);
                return req.session.save(function(err){
                    return res.redirect('/registration');
                })
            }
        } catch(error){
            next(error);
        }
    },

    isEmailUniqueCheck: async function(req, res, next){
        try{
            var [rows, fields] = await db.execute(`SELECT id FROM email WHERE email=?;`, [email]); // don't use username="username" or else that leads to SQL injection
            console.log(rows);
            if(rows && rows.length > 0){
                req.flash("error", `Email already exists!`);
                return req.session.save(function(err){
                    return res.redirect('/registration');
                })
            }
        } catch(error){
            next(error);
        }
    },
}