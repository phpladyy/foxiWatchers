import { useEffect, useState } from "react";

import { SearchBar } from "./SearchBar";
import { WatchedSummary } from "./WatchedSummary";
import { WatchedList } from "./WatchedList";
import { MovieList } from "./MovieList";
import { Navbar } from "./Navbar";
import { SelectedMovie } from "./SelectedMovie";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { ModeSwitch } from "./ModeSwitch";


export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export const KEY = "4e376efd";

export default function App() {
  const [query, setQuery] = useState("shutter");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorage([], "watched");

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

  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <ModeSwitch/>
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

export const Loader = () => <p className="loader">Loading...</p>;

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
