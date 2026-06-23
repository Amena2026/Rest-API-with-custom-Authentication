const express = require('express')
const cors = require('cors')
const notesRouter = require('./routes/notes')
const blogRouter = require('./routes/blogs')
const userRouter = require('./routes/users')
const loginRouter = require('./routes/login')
const middleware = require('./utils/middleware')
const app = express()

app.use(express.json()) // parses incoming JSON request bodies
app.use(cors())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)

app.get('/', (req, res) => {
    res.send("welcome to the home page of our app ")
})

app.get('/bird', (req, res) => {
    res.send("welcome to the bird page of our app")
})

// whenever a request comes to the express server with the /notes path, pass that request to the notesRouter express router
app.use('/notes', notesRouter)
app.use('/blogs', blogRouter)
app.use('/users', userRouter )
app.use('/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

/* global error handler middleware
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ error: err.message })
}) */



module.exports = app; 