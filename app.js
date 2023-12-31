const path = require('path')

const express = require('express')

const app = express()

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.get('/', function(req, res) {
    res.render('index')
})

app.listen(3000)

