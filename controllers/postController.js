const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res){
    res.render('create-post');
}

exports.create = function(req, res){
    let post = new Post(req.body, req.session.user._id)
    post.create().then(function(newId){
        
        req.flash("success", "New Post successfully created")
        req.session.save(()=>{
            res.redirect(`/post/${newId}`)
        })
    }).catch(function(errors){
        errors.forEach(error => req.flash("errors", error))
        req.session.save(()=>{
            res.redirect("/create-post")
        })
    })
}

exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    }catch{
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id)
        if(post.authorId == req.visitorId){
            res.render("edit-post", {post: post})
        }else{
            req.flash("errors", "You do not have permission for this action!")
            req.session.save(()=>{
                res.redirect("/")
            })
        }
    }catch{
        res.render("404")
    }
}

exports.edit = async function(req, res){
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status)=>{
        //post was successfully saved
        //or user did have permission, but there are validation errors
        if(status == "success"){
            //post updated in the database
            req.flash("success", "Post successfully updated")
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }else{
            post.errors.forEach(function(error){
                req.flash("errors", error)
            })
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(()=>{
        //a post with requested id doesn't exist 
        //or current visitor is not the owner of post
        req.flash("errors", "You do not have permission to update this post!")
        req.session.save(function(){
            res.redirect("/")
        })
    })
}

exports.delete = function(req, res){
    Post.delete(req.params.id, req.visitorId).then(()=>{
        req.flash("success", "Post successfully deleted.")
        req.session.save(()=>{
            res.redirect(`/profile/${req.session.user.username}`)
        })
    }).catch(()=>{
        req.flash("errors", "You do not have permission to perform this task.")
        req.session.save(()=>{
            res.redirect('/')
        })
    })
}