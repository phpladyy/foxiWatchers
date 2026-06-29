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

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
export const KEY = process.env.REACT_APP_KEY;
export const Loader = () => <p className="loader">Loading...</p>;

export default function App() {
  const [query, setQuery] = useState("movie");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useState([]);

  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useLocalStorage(null, "sessionId");

  const fetchWatchedlist = useCallback(async () => {
    const res = await fetch("/.netlify/functions/getWatchedlist", {
      method: "POST",
      body: JSON.stringify({ session }),
    });
    const { watched, error } = await res.json();
    if (error) {
      console.log(error);
      return;
    }
    setWatched(watched);
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchData = async () => {
      const rawData = await fetch("/.netlify/functions/getProfile", {
        method: "POST",
        body: JSON.stringify({ session }),
      });
      const { data, error } = await rawData.json();
      if (error) {
        console.log("fetch user error:", error);
        return;
      }
      if (data) {
        setUserProfile(data);
        setAuthChecked(true);
        await fetchWatchedlist();
      } else {
        setSession(null);
        setUserProfile(null);
      }
    };
    fetchData();
  }, [session, setSession, fetchWatchedlist]);

  async function handleAddWatched(movie) {
     setWatched((prev) => [...prev, movie]); 
    const res = await fetch("/.netlify/functions/addWatched", {
      method: "POST",
      body: JSON.stringify({ session, watched, movie }),
    });
    const { error } = await res.json();
    if (error) {
      console.log(error);
      return;
    }
  }

  async function handleRemoveWatched(e, id) {
    e.stopPropagation();
    setWatched((prev) => prev.filter((item)=>item.imdbID!==id)); 
    const res = await fetch("/.netlify/functions/removeWatched", {
      method: "POST",
      body: JSON.stringify({ session, watched, imdbID: id }),
    });
    const { error } = await res.json();
    if (error) {
      console.log(error);
      return;
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
      {!session ? (
        
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
