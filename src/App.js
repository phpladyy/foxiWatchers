import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { WatchedSummary } from "./WatchedSummary";
import { WatchedList } from "./WatchedList";
import { MovieList } from "./MovieList";
import { Navbar } from "./Navbar";
import { SelectedMovie } from "./SelectedMovie";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { ModeSwitch } from "./ModeSwitch";
import { Login } from "./Login";
import supabase from "./supabase-client";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export const KEY = process.env.REACT_APP_KEY;

export const Loader = () => <p className="loader">Loading...</p>;

export default function App() {
  const [query, setQuery] = useState("movie");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useLocalStorage(null, "sessionId");

  const fetchWatchedlist = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("watched_movies")
      .eq("id", session);
    if (error) {
      console.log("fetch error:", error);
      return;
    }
    if (!data || data.length === 0) {
      return;
    }
    setWatched(data[0].watched_movies || []);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchWatchedlist();
  }, [session, fetchWatchedlist]);

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session)
        .maybeSingle();
      if (error) {
        console.log("fetch user error:", error);
        return;
      }
      if (data) {
        setUserProfile(data);
        setAuthChecked(true);
      } else {
        setSession(null);
        setUserProfile(null);
      }
    };
    fetchData();
  }, [session, setSession]);

  async function handleAddWatched(movie) {
    const { error } = await supabase
      .from("profiles")
      .update({ watched_movies: [...watched, movie] })
      .eq("id", session);

    if (error) {
      console.log("err adding movie:", error);
    } else {
      fetchWatchedlist();
    }
  }
  async function handleRemoveWatched(e, id) {
    e.stopPropagation();

    const { error } = await supabase
      .from("profiles")
      .update({ watched_movies: watched.filter((item) => item.imdbID !== id) })
      .eq("id", session);
    if (error) {
      console.log("err removing movie:", error);
    } else {
      fetchWatchedlist();
    }
  }

  function handleMovieSelect(id) {
    selectedId === id ? setSelectedId(null) : setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  return (
    <>
      {!authChecked ? (
        <Login setUserProfile={setUserProfile} setSession={setSession} />
      ) : (
        <>
          <Navbar>
            <SearchBar query={query} setQuery={setQuery} />
            <ModeSwitch />
            <UserTab userProfile={userProfile} />
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
                  userProfile={userProfile}
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
                    onMovieSelect={handleMovieSelect}
                  />
                </>
              )}
            </Panel>
          </Main>
        </>
      )}
    </>
  );
}

const ErrorMessage = ({ message }) => <p className="error">{message}</p>;

function UserTab({ userProfile }) {
  if (!userProfile) return;
  return (
    <img
      className="nav-profile-picture"
      src={userProfile.avatar}
      alt={userProfile.name}
    />
  );
}

const Main = ({ children }) => <main className="main">{children}</main>;

function Panel({ children }) {
  return <div className="box">{children}</div>;
}
