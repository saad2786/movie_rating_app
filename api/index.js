const express = require('express')
const app = express()

const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
const useMovie = require('./routes/movies')
app.use(helmet())
app.use(express.json())
app.use(morgan('common'))

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Database Connected')
})
app.use('/movies', useMovie)

app.listen(8800, () => {
  console.log('Backend Server is Running!')
})
