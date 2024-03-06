const router = require('express').Router()
const Watched = require('../models/watchedMovies')

//? get all watched movies
router.get('/', async (req, res) => {
  try {
    const movies = await Watched.find({})
    res.status(200).send(movies)
  } catch (err) {
    res.status(400).send(err)
  }
})

//? Add movie to watched list
router.post('/:id', async (req, res) => {
  console.log(req.body)
  const {
    imdbID,
    title,
    released,
    runtime,
    poster,
    actors,
    imdbRating,
    userRating,
    genre,
  } = req.body
  const newMovie = await new Watched({
    imdbID,
    title,
    released:
      released === 'N/A' || released === undefined ? '09/11/23' : released,
    runtime: runtime || 90,
    genre: genre.split(','),
    actors: actors || ['Saad'],
    poster,
    imdbRating,
    userRating,
  })
  try {
    const movie = await newMovie.save()
    res.status(200).send(movie)
  } catch (err) {
    console.log(err)
  }
})

//? Delete movie from watched list
router.delete('/:id', async (req, res) => {
  const { id } = req.query
  try {
    const movie = await Watched.deleteOne({ imdbID: id })
    res.status(200).send({
      message: 'Successfully Deleted movie',
    })
    console.log('Successfully Deleted movie', movie)
  } catch (err) {
    console.log(err)
  }
})
module.exports = router
