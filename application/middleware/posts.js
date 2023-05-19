var pathToFFMPEG = require('ffmpeg-static');
var exec = require('child_process').exec;
var db = require('../conf/database');

module.exports = {
    makeThumbnail: async function(req, res, next){
        if(!req.file){ // check if the uploaded file exists, which is req.file
            next(new Error("File upload failed."));
        } else{
            try{
                var destinationOfThumbnail = `public/images/uploads/thumbnail-${req.file.filename.split(".")[0]}.png`; // the "split" function removes periods
                var thumbnailCommand = `${pathToFFMPEG} -ss 00:00:01 -i ${req.file.path} -y -s 200x200 -vframes 1 -f image2 ${destinationOfThumbnail}`;
                exec(thumbnailCommand);
                req.file.thumbnail = destinationOfThumbnail;
                console.log("The program believes that a thumbnail has been created.");
                next();
            } catch (error){
                next(error);
            }
        }
    },


    getPostsById: async function(req, res, next){
        try {
            var{id} = req.params;

            // Everytime we view a new post, req.session updates with the current post id
            req.session.postId = id;
            console.log("req.session.postId is: " + req.session.postId);

            var [rows, fields] = await db.execute(
              `SELECT id, title, video, description, createdAt, thumbnail, fk_idOfUser FROM csc317db.posts WHERE id = ?;`,[id]);
            res.locals.videoPost = rows;
            console.log("rows.length is: " + rows.length);
            
            // Need to add the user's name to res.locals.videoPost
            var [rows2, fields] = await db.execute(
                `SELECT username FROM csc317db.users WHERE id = ?;`,[res.locals.videoPost[0].fk_idOfUser]);
            res.locals.videoPost[0].username = rows2[0].username;
            
            console.log("Creator of the video is: " + res.locals.videoPost[0].username);

            next();
          } catch (error) {
            next(error);
          }
    },


    getCommentsForPostById: async function(req, res, next){  
      var id = req.session.postId;
        try {
          console.log("post's id's is: " + id);
          var [rows, fields] = await db.execute(
            `SELECT fk_userId, text, createdAt FROM csc317db.comments WHERE fk_postId = ?;`,[id]); 
          res.locals.comments = rows;
          
          // We have userIds, but not actual usernames. Need to grab the actual username and attach them to res.locals object
          for(i = 0; i < rows.length; i++){
            var [rows2, fields] = await db.execute(
              `SELECT username FROM csc317db.users WHERE id = ?;`,[res.locals.comments[i].fk_userId]);
              res.locals.comments[i].username = rows2[0].username;
          }
          next();
        } catch (error) {
          next(error);
        }
    },


    getPostsForUserById: async function(req, res, next) {
        try {
          var userId = req.session.user.userId;
          console.log("userId of logged in user is: " + userId);
          var [rows, fields] = await db.execute(
            `SELECT id, title, video, createdAt, thumbnail FROM csc317db.posts WHERE fk_idOfUser = ?;`,[userId]);
          res.locals.userPosts = rows;
          next();
        } catch (error) {
          next(error);
        }
    },


    getRecentPosts: async function(req, res, next){
        try{
            const [rows, fields] = await db.execute(`SELECT id, title, video, createdAt, thumbnail FROM csc317db.posts ORDER BY createdAt DESC;`);
            res.locals.recentPosts = rows;
            next();
        }catch(error){
          next(error);
        }
    },

}