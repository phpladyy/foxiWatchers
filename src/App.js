import { useEffect, useState } from "react";
import StarRating from "./StarRating";

import { SearchBar } from "./SearchBar";
import { WatchedSummary } from "./WatchedSummary";
import { WatchedList } from "./WatchedList";
import { MovieList } from "./MovieList";
import { Navbar } from "./Navbar";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "4e376efd";

export default function App() {
  const [query, setQuery] = useState("");
  const tempQuery = "interstellar";

  const [watched, setWatched] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleMovieSelect(id) {
    selectedId === id ? setSelectedId(null) : setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleRemoveWatched(id) {
    setWatched((watched) => watched.filter((item) => item.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&type=movie&page=1&apikey=${KEY}`,
            { signal: controller.signal },
          );

          if (!res.ok) throw new Error("something went wrong with fetching");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          console.log(err.message);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <ResultsNum movies={movies} />
      </Navbar>

      <Main>
        <Panel>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onMovieSelect={handleMovieSelect} />
          )}
          {error && <ErrorMessage message={error} />}
        </Panel>

        <Panel>
          {selectedId ? (
            <SelectedMovie
              key={selectedId}
              apiKey={KEY}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onRemoveWatched={handleRemoveWatched}
              />
            </>
          )}
        </Panel>
      </Main>
    </>
  );
}

const Loader = () => <p className="loader">Loading...</p>;

const ErrorMessage = ({ message }) => <p className="error">{message}</p>;

function ResultsNum({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

const Main = ({ children }) => <main className="main">{children}</main>;

function Panel({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function SelectedMovie({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [userRating, setUserRating] = useState(null);
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isWatched = watched.map((item) => item.imdbID).includes(selectedId);
  const url = `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`;

  const userRate = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      userRating,
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  //closing movie on escape key press
  useEffect(
    function () {
      function closeOnEcape(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", closeOnEcape);
      return function () {
        document.removeEventListener("keydown", closeOnEcape);
      };
    },
    [onCloseMovie],
  );

  // fetching selected movie details
  useEffect(() => {
    async function getDetails() {
      setIsLoading(true);
      const detailsRaw = await fetch(url);
      const movieDetails = await detailsRaw.json();
      setMovie((movie) => movieDetails);
      setIsLoading(false);
    }
    getDetails();
  }, [url]);

  //web page title changer
  useEffect(() => {
    document.title = title ? title : "Loading...";
    //resetting title on onmount
    return () => {
      document.title = "Foxie's Watchlist";
    };
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &times;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &sdot; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    size={4}
                    maxRating={10}
                    onsetUserRating={setUserRating}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to watched-list
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this movie {userRate} stars</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Directed by: {director}</p>
            <p>Actors: {actors}</p>
          </section>
        </>
      )}
    </div>
  );
}
