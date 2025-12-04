import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import axios from "axios";
import { useMovies } from "./useMovies";
import CircularProgress from "@mui/material/CircularProgress";
import { default as Container } from "@mui/material/Box";
const API_URL = process.env.REACT_APP_API_URL;

const average = (arr) =>
  arr.length === 0 ? 0 : arr.reduce((acc, cur) => acc + cur / arr.length, 0);

const KEY = process.env.REACT_APP_API_KEY;

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [watched, setWatched] = useState([]);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const { movies, isLoading, error } = useMovies(query);

  // FIX 1: Add abort controller to cancel request on unmount
  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsMoviesLoading(true);
          const res = await axios.get(`${API_URL}/movies`, {
            signal: controller.signal,
          });
          const data = res.data; // FIX 2: Changed from 'await res.data' (incorrect syntax)
          if (data && Array.isArray(data)) {
            setWatched(data);
          }
        } catch (err) {
          if (err.name !== "CanceledError") {
            console.log(err);
          }
        } finally {
          setIsMoviesLoading(false);
        }
      }
      fetchMovies();

      return () => controller.abort(); // FIX 3: Cleanup function to cancel request
    },
    [] // FIX 4: Changed dependency array - removed setWatched
  );

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId("");
  }

  async function handleAddWatched(newMovie) {
    try {
      setIsMoviesLoading(true);
      const res = await axios.post(`${API_URL}/movies/123`, newMovie);
      setWatched((movies) => [...movies, res.data]);
    } catch (err) {
      console.log(err);
    } finally {
      setIsMoviesLoading(false);
    }
  }

  async function handleDeleteWatched(id) {
    try {
      setIsMoviesLoading(true);
      await axios.delete(`${API_URL}/movies/123?id=${id}`);
      setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    } catch (err) {
      console.log(err);
    } finally {
      setIsMoviesLoading(false);
    }
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
                isMoviesLoading={isMoviesLoading}
                watched={watched}
                onDeleteMovie={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>⛔</span>
      {message}
    </p>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}

function NavBar({ children }) {
  return <nav className='nav-bar'>{children}</nav>;
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null); // FIX 5: Initialize with null

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current?.focus(); // FIX 6: Safe optional chaining
    setQuery("");
  });

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function ResultCount({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className='box'>
      <button
        className='btn-toggle'
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className='list list-movies'>
      {movies.length > 0 &&
        movies.map((movie) => (
          <Movie
            movie={movie}
            key={movie.imdbID}
            onSelectMovie={onSelectMovie}
          />
        ))}
    </ul>
  );
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
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // FIX 7: Safe handling of watched array
  const isWatched = Array.isArray(watched) && watched.map((movie) => movie.imdbID).includes(selectedId);
  const userWatchedRated = watched?.find((movie) => selectedId === movie.imdbID)?.userRating;

  const {
    Title: title = "",
    imdbRating = "",
    Runtime: runtime = "",
    Actors: actors = "",
    Genre: genre = "",
    Poster: poster = "",
    Plot: plot = "",
    Director: director = "",
    Released: released = "",
  } = movie;

  function handleAddWatched() {
    const newMovie = {
      imdbID: selectedId,
      title,
      actors,
      released,
      runtime: Number(runtime.split(" ").at(0)),
      poster,
      genre,
      userRating,
      imdbRating: Number(imdbRating),
    };
    onAddWatched(newMovie);
    onCloseMovie("");
  }

  function handleUserRating(rating) {
    setUserRating(rating);
  }

  // FIX 8: Add abort controller for fetch
  useEffect(
    function () {
      const controller = new AbortController();

      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
            { signal: controller.signal }
          );

          const data = await res.json();
          setMovie(data);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err);
          }
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();

      return () => controller.abort(); // FIX 9: Cleanup
    },
    [selectedId]
  );

  // FIX 10: Add cleanup for document title
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useKey("Escape", onCloseMovie);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className='details'>
          <button className='btn-back' onClick={() => onCloseMovie("")}>
            &larr;
          </button>
          <header>
            <img src={poster} alt={title} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐ {imdbRating} IMDb rating </p>
            </div>
          </header>
          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={20}
                    onSetMovieRating={handleUserRating}
                  />
                  {userRating > 0 && (
                    <button className='btn-add' onClick={handleAddWatched}>
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
  );
}

function WatchedSummary({ watched, onDeleteMovie, isMoviesLoading }) {
  if (isMoviesLoading) return <Spinner />;
  return (
    <ul className='list'>
      {Array.isArray(watched) &&
        watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <img
        src={movie.poster || "/images/poster.jpeg"}
        alt={`${movie.title} poster`}
      />
      <h3>{movie.title}</h3>
      <div>
        <Rating rate={movie.imdbRating}>⭐️</Rating>
        <Rating rate={movie.userRating}>🌟</Rating>
        <Rating rate={movie.runtime}>⏳</Rating>
      </div>
      <button
        className='btn-delete'
        onClick={() => onDeleteMovie(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function Rating({ rate, children }) {
  return (
    <p>
      <span>{children}</span>
      <span>
        {rate} {rate > 10 ? "min" : ""}
      </span>
    </p>
  );
}

function Summary({ watched }) {
  // FIX 11: Safe array handling with length check
  const avgImdbRating =
    watched.length > 0
      ? average(watched.map((movie) => movie.imdbRating))
      : 0;
  const avgUserRating =
    watched.length > 0
      ? average(watched.map((movie) => movie.userRating))
      : 0;
  const avgRuntime =
    watched.length > 0 ? average(watched.map((movie) => movie.runtime)) : 0;

  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <CircularProgress />
    </Container>
  );
}