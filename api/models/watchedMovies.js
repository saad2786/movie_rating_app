const mongoose = require('mongoose')

const WatchedSchema = new mongoose.Schema(
  {
    imdbID: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    released: {
      type: Date,
      required: true,
    },
    runtime: {
      type: Number,
      required: true,
    },
    genre: {
      type: Array,
    },
    imdbRating: {
      type: Number,
    },
    poster: {
      type: String,
    },
    userRating: {
      type: Number,
    },
    desc: {
      type: String,
    },
    actors: {
      type: Array,
      required: true,
    },
    director: {
      type: String,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('watchedMovies', WatchedSchema)
