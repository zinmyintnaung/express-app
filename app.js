const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')
const app = express()

let sessionOptions = session({
    secret: "Something I want to hide", 
    store: MongoStore.create({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
}) 

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next){
    //make our markdown function available from within ejs templates
    res.locals.filterUserHTML = function(content){
        return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'b'], allowedAttributes: []})
    }
    
    //make all errors and success flash messages for all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    
    //make current user ID available on req object
    if(req.session.user){
        req.visitorId = req.session.user._id
    }else{
        req.visitorId = 0
    }
    
    //make session data available from view templates
    res.locals.user = req.session.user
    next()
})

const router = require('./router.js')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app