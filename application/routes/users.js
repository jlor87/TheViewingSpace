var express = require('express');
var router = express.Router();
var db = require('../conf/database.js');
var bcrypt = require('bcrypt');
const { isMyProfile, isLoggedIn } = require('../middleware/auth.js');
const { getPostsForUserById } = require('../middleware/posts.js');
const { usernameCheck, emailCheck, passwordCheck, confirmPasswordCheck, tosCheck, ageCheck, isUsernameUniqueCheck, isEmailUniqueCheck} = require('../middleware/validation.js');

// localhost:3000/users/registration
router.post('/registration', async function(req, res, next){
  console.log(req.body);
  var {username, email, password, confirmPassword, ageCheckBox, tosCheckBox} = req.body;

  // ---------- input validation, copied from assignment4 ----------
  let usernameCorrect = usernameCheck;
  let emailValid = emailCheck;
  let passwordCorrect = passwordCheck;
  let confirmPasswordCorrect = confirmPasswordCheck;
  let ageAbove13 = ageCheck;
  let readTOS = tosCheck;
  let allConditionsPass = false;

      // if all conditions meet, go on
      if (usernameCorrect && emailValid && 
          passwordCorrect && confirmPasswordCorrect &&
          ageAbove13 && readTOS){
              allConditionsPass = true;
      }

  // --------- end input validation ---------

  if(allConditionsPass){
    try{
      // Checking username uniqueness
      var [rows, fields] = await db.execute(`SELECT id FROM users WHERE username=?;`, [username]); // don't use username="username" or else that leads to SQL injection
      console.log(rows);
      if(rows && rows.length > 0){
        req.flash("error", `Username already exists!`);
        return res.redirect('/registration');
      }

      // Checking email uniqueness
      var [rows, fields] = await db.execute(`SELECT email FROM users WHERE email=?;`, [email]); // don't use username="username" or else that leads to SQL injection
      if(rows && rows.length > 0){
        req.flash("error", `Email already in use!`);
        return res.redirect('/registration');
      }

      // --------- At this point, we know the data is good and ready to go into the database ----------

      var hashedPassword = await bcrypt.hash(password, 3);

      // Insert
      var [resultObject, fields] = await db.execute(`INSERT INTO users (username, email, password) VALUE (?,?,?);`, [username, email, hashedPassword]);

      // Respond
      if(resultObject && resultObject.affectedRows == 1){
        req.flash("success", `Successfully registered!`);
        return res.redirect('/login');
      } else{
        req.flash("error", `Sorry, error while registering!`);
        return res.redirect('/registration');
      }

    // Error
    } catch(error){
      req.flash("error", `User input does not meet requirements. Please try again.`);
      return res.redirect('/registration');
    }

  } else{
    req.flash("error", `User input does not meet requirements. Please try again.`);
    return res.redirect('/registration');
  }

});


router.post('/login', async function(req, res, next){
  console.log(req.body);
  var {username, password} = req.body;

  try{
    var [rows, fields] = await db.execute(`SELECT id, username, password, email FROM users WHERE username = ?;`, [username]);
    var user = rows[0];

    if(rows.length != 0){
        var passwordsMatch = await bcrypt.compare(password, user.password);
        console.log('passwordsMatch is' + passwordsMatch);
        if(passwordsMatch){
          req.flash("success", `Login successful.`);
          req.session.user = {
            userId: user.id,
            email: user.email,
            username: user.username
          };
          return res.redirect('/');
        }
    } else{
        req.flash("error", `Username or password incorrect!`);
        req.session.save(function(err){
          return res.redirect('/login');
        }) 
    }
  } catch(error){
    req.flash("error", `Unknown error!`);
        req.session.save(function(err){
          return res.redirect('/login');
        }) 
  }
});

router.get('/postvideo', isLoggedIn, function(req, res, next) {
  if(res.locals.isLoggedIn){
    res.render('postvideo');
  }
  else {
    return res.redirect('/login');
  }
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err){
    if(err){
      next(error);
    }
    return res.redirect('/');
  })
});

// Middleware to ensure that you can only access your own unique profile -

router.get("/profile/:id(\\d+)", isLoggedIn, isMyProfile, getPostsForUserById, function(req, res, next) {
  if (isMyProfile) {
    res.render('profile', { username: res.locals.user.username, email: res.locals.user.email, recentPosts: res.locals.userPosts, deletePost: false});
  }
  else {
    req.flash("error", 'All profiles are set to private - you cannot view a profile that is not yours!');
    return res.redirect('/login');
  }
});


module.exports = router;
