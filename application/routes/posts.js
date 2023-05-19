var express = require('express');
var router = express.Router();
var db = require('../conf/database');
var multer = require('multer');
const { isLoggedIn, isMyProfile } = require('../middleware/auth');
const { makeThumbnail, getRecentPosts, getPostsForUserById } = require('../middleware/posts');


const storage = multer.diskStorage({
    // Tells multer where to store the file
    destination: function (req, file, cb) {
      cb(null, "public/videos/uploads");
    },
    // Creates the filename
    filename: function (req, file, cb) {
      var fileExt = file.mimetype.split("/")[1];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // uses current timestamp to make a unique suffix
      cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`);
    }
  })
  
const upload = multer({ storage: storage })


router.post("/create", isLoggedIn, upload.single("videofile"), makeThumbnail, async function (req, res, next){
    console.log(req.file);
    console.log(req.body);
    var {videotitle, videodesc} = req.body;
    var {path, thumbnail} = req.file;
    var {userId} = req.session.user;
    try{
        var[insertResult] = await db.execute(`INSERT INTO posts (title, description, video, thumbnail, fk_idOfUser) VALUE (?, ?, ?, ?, ?);`, [videotitle, videodesc, path, thumbnail, userId])
        if(insertResult && insertResult.affectedRows){
            console.log("Success! Your post was created!");
            req.flash("success", "Success! Your post was created!");
            return res.redirect(`/`);
        } else{
            console.log('Post could not be made!');
            next(new Error('Post could not be made!'));
            if(err) next(err);
            return req.redirect(`/`)
        }
    } catch(error){
        next(error);
    }
});

router.post("/search", getRecentPosts, async function(req, res, next){
    console.log(req.body);
    var {search} = req.body;
    console.log("search word is: " + search);

    try{
        var[rows, fields] = await db.execute(`SELECT id, title, description, createdAt, thumbnail, concat_ws(' ', title, description) as haystack FROM csc317db.posts having haystack like ?;`, ['%' + search + '%']);
        console.log("rows.length is: " + rows.length);
        if(search != "" && rows && rows.length != 0){
            res.locals.currentPost = rows;
            return res.render('index', {title: "Search Results", recentPosts: res.locals.currentPost});
        } else{
            return res.render('index', {title: "No Search Results. But check out these recent videos!", recentPosts: res.locals.recentPosts});
        }
    } catch(error){
        next(error);
    }
});

router.post("/comment", isLoggedIn, async function(req, res, next){
    var userId = req.session.user.userId;
    var {comments} = req.body;
    var id = req.session.postId; // the id of the specific post

    try{
        var [resultObject, fields] = await db.execute(`INSERT INTO comments (fk_userId, text, fk_postId) VALUE (?,?,?);`, [userId, comments, id]);
        console.log("resultObject is:" + resultObject);
        if(resultObject && resultObject.affectedRows == 1){
            req.flash("success", `Comment successfully posted!`);
        }
        else{
            req.flash("error", `Sorry, your comment was unable to be posted.`);
        }
        return res.redirect(`/viewpost/${id}`);
    } catch(error){
        next(error);
    }
});

router.get("/delete/:id(\\d+)", isLoggedIn, isMyProfile, getPostsForUserById, async function(req, res, next){
    res.render('profile', { username: res.locals.user.username, email: res.locals.user.email, recentPosts: res.locals.userPosts, deletePost: true });
});

router.get("/deletepost/:id(\\d+)", getPostsForUserById, async function(req, res, next){
    try{
        var {id} = req.params;
        console.log("post id is: " + id);
        var[rows, fields] = await db.execute(`DELETE FROM comments WHERE fk_postId = ?;`, [id]);
        var[rows2, fields2] = await db.execute(`DELETE FROM posts WHERE id=?;`, [id]);
        console.log("rows.length is: " + rows.length);
        if(rows2 && rows2.length != 0){
            req.flash("success", "Post successfully deleted!");
        } else{
            req.flash("error", "There was an error deleting your post!");
        }
        res.redirect(`/users/profile/${res.locals.user.userId}`);    
    }catch(error){
        next(error);
    }
});
  

module.exports = router;