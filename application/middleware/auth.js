// Anything that deals with the session object goes here:

module.exports = {
    // Middleware is here because you need to be logged in to do many things
    isLoggedIn: function(req, res, next){
        if(req.session.user){ // This would be false if it is undefined, i.e. user is not logged in
            next();
        }else{
            req.flash("error", 'You are not logged in to perform or access this!');
            req.session.save(function(err){
                if(err) next(err);
                res.redirect("/login");
            })
        }
    },

    // What if you go onto someone else's profile? Everyone's profile is private in this app
    isMyProfile: function(req, res, next){
        var{id} = req.params;
        if(id == req.session.user.userId){ // i.e. if the profile id on your website matches your id
            next();
        }else{
            req.flash("error", 'This is not your profile. This profile is private.');
            req.session.save(function(err){
                if(err) next (err);
                    res.redirect('/');
            })
        }
    },

}