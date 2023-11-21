import { useEffect, useRef, useState } from 'react'
import StarRating from './StarRating'
import { useKey } from './useKey'
import { useLocalStorageState } from './useLocalStorageState'
import { useMovies } from './useMovies'
const tempMovieData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  },
]

// const tempWatchedData = [
//   {
//     imdbID: 'tt1375666',
//     title: 'Inception',
//     Year: '2010',
//     poster:
//       'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: 'tt0088763',
//     title: 'Back to the Future',
//     Year: '1985',
//     poster:
//       'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ]

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)
const KEY = process.env.REACT_APP_API_KEY

export default function App() {
  // const [watched, setWatched] = useState()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [watched, setWatched] = useLocalStorageState([], 'watched')
  const { movies, isLoading, error } = useMovies(query)
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id))
  }
  function handleCloseMovie() {
    setSelectedId('')
  }
  function handleAddWatched(newMovie) {
    setWatched((movies) => [...movies, newMovie])
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <ResultCount movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MoviesList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedSummary
                watched={watched}
                onDeleteMovie={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  )
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  )
}
function Loader() {
  return <p className="loader">Loading...</p>
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}
function Search({ query, setQuery }) {
  const inputEl = useRef()

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) return
    inputEl.current.focus()
    setQuery('')
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}
function ResultCount({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}
function Main({ children }) {
  return <main className="main">{children}</main>
}
function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true)
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? '–' : '+'}
      </button>
      {isOpen1 && children}
    </div>
  )
}
function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list  list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData)
//   const [isOpen2, setIsOpen2] = useState(true)

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? '–' : '+'}
//       </button>
//       {isOpen2 && (
//         <>
//           <Summary watched={watched} />
//           <WatchedSummary watched={watched} />
//         </>
//       )}
//     </div>
//   )
// }
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const userWatchedRated = watched.find((movie) => {
    return selectedId === movie.imdbID
  })?.userRating

  const {
    Title: title,
    imdbRating,
    Runtime: runtime,
    Actors: actors,
    Genre: genre,
    Poster: poster,
    Plot: plot,
    Director: director,
    Released: released,
  } = movie
  function handleAddWatched(movie) {
    const newMovie = {
      imdbID: selectedId,
      title,
      runtime: Number(runtime.split(' ').at(0)),
      poster,
      userRating,
      imdbRating: Number(imdbRating),
    }
    onAddWatched(newMovie)
    onCloseMovie(true)
  }
  function handleUserRating(rating) {
    setUserRating(rating)
  }
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true)
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        )

        const data = await res.json()

        setMovie(data)
        setIsLoading(false)
      }
      getMovieDetails()
    },
    [selectedId],
  )
  useEffect(
    function () {
      if (!title) return
      document.title = `Movie | ${title}`
      return function () {
        document.title = 'usePopcorn'
        // console.log(title)
      }
    },
    [title],
  )
  useKey('Escape', onCloseMovie)
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="details">
          <button className="btn-back" onClick={() => onCloseMovie('')}>
            &larr;
          </button>
          <header>
            <img src={poster} alt={title} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐ {imdbRating} IMDb rating </p>
            </div>
          </header>
          <section>
            <div className="rating  ">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={20}
                    onSetMovieRating={handleUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddWatched}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You already rated this {userWatchedRated} <span>⭐</span>
                </p>
              )}
            </div>
            <p>{plot}</p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </>
  )
}
function WatchedSummary({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteMovie={onDeleteMovie}
        />
      ))}
    </ul>
  )
}
function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <Rating rate={movie.imdbRating}>⭐️</Rating>
        <Rating rate={movie.userRating}>🌟</Rating>
        <Rating rate={movie.runtime}>⏳</Rating>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDeleteMovie(movie.imdbID)}
      >
        X
      </button>
    </li>
  )
}
function Rating({ rate, children }) {
  return (
    <p>
      <span>{children}</span>
      <span>
        {rate} {rate > 10 ? 'min' : ''}
      </span>
    </p>
  )
}
function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
  const avgUserRating = average(watched.map((movie) => movie.userRating))
  const avgRuntime = average(watched.map((movie) => movie.runtime))
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}
