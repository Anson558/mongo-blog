const path = require('path')

const express = require('express')
const mongodb = require('mongodb')

const ObjectId = mongodb.ObjectId;

const db = require('./data/database')

const app = express()

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.get('/', function (req, res) {
    res.render('index')
})

app.get('/posts', async function (req, res) {
    const posts = await db
        .getDb()
        .collection('posts')
        .find({})
        .project({
            title: 1,
            summary: 1,
            'author.name': 1
        })
        .toArray();
    res.render('posts', { posts: posts })
})

app.get('/posts/:id', async function (req, res) {
    const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(req.params.id) })

    post.humanReadableDate = post.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    res.render('post-detail', { post: post })
})

app.post('/posts/:id/delete', async function (req, res) {
    db.getDb().collection('posts').deleteOne({ _id: new ObjectId(req.params.id) })
    res.redirect('/posts')
})

app.get('/posts/:id/edit', async function (req, res) {
    const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    const authors = await db.getDb().collection('authors').find().toArray()
    console.log(authors)
    res.render('update', { authors: authors, post: post })
})

app.post('/posts/:id/edit', async function (req, res) {
    const authorId = new ObjectId(req.body.author)
    const author = await db.getDb().collection('authors').findOne({ _id: authorId })

    const newPost = {
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
    };

    const result = await db.getDb().collection('posts').updateOne({ _id: new ObjectId(req.params.id) }, { $set: newPost })
    console.log(req.params.id)
    res.redirect('/posts')
})

app.get('/create', async function (req, res) {
    const authors = await db.getDb().collection('authors').find().toArray()
    console.log(authors)
    res.render('create', { authors: authors })
})

app.post('/create', async function (req, res) {
    const authorId = new ObjectId(req.body.author)
    const author = await db.getDb().collection('authors').findOne({ _id: authorId })

    const newPost = {
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        date: new Date(),
        author: {
            id: author.id,
            name: author.name,
            email: author.email
        }
    };

    const result = await db.getDb().collection('posts').insertOne(newPost);
    res.redirect('/posts')
})

db.connectToDatabase().then(function () {
    app.listen(3000)
});

