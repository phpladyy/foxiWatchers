import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "4e376efd";

export default function App() {
  const [query, setQuery] = useState("stinky");
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

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?s=${query}&type=movie&page=1&apikey=${KEY}`,
          );

          if (!res.ok) throw new Error("something went wrong with fetching");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 2) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
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
              apiKey={KEY}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} />
            </>
          )}
        </Panel>
      </Main>
    </>
  );
}

const Loader = () => <p className="loader">Loading...</p>;

const ErrorMessage = ({ message }) => <p className="error">{message}</p>;

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

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
function MovieList({ movies, onMovieSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem
          key={movie.imdbID}
          movie={movie}
          handleMovieSelect={onMovieSelect}
        />
      ))}
    </ul>
  );
}

function MovieItem({ movie, handleMovieSelect }) {
  return (
    <li onClick={() => handleMovieSelect(movie.imdbID)}>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
        onError={(e) =>
          (e.target.src =
            "https://placehold.jp/150/3d4070/ffffff/550x900.png?text=No+Poster")
        }
      />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📅</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function SelectedMovie({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [userRating, setUserRating] = useState(null);
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isWatched = watched.map((item) => item.imdbID).includes(selectedId);
  const url = `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`;
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

  useEffect(
    function () {
      async function getDetails() {
        setIsLoading(true);
        const detailsRaw = await fetch(url);
        if (!detailsRaw.ok) {
          throw new Error(`Fetching error`);
        }
        const movieDetails = await detailsRaw.json();
        console.log(movieDetails);
        setMovie(movieDetails);
        setIsLoading(false);
      }
      getDetails();
    },
    [selectedId],
  );

  return (
    <div key={selectedId} className="details">
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
                  {" "}
                  <StarRating
                    size={24}
                    maxRating={10}
                    onsetUserRating={setUserRating}
                  />
                  {userRating > 0 ? (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to watched-list
                    </button>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                <p>You already watched this movie</p>
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

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

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
  );
}

function WatchedList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedItem key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

function WatchedItem({ movie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
