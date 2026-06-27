import { useEffect, useState } from "react";
import axios from "axios";
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

export const KEY = "4e376efd";
export const SUPABASE_KEY = "sb_publishable_VEWzN4h7ZHRbaaozGt8uSQ_jypDbqZp";
export const SUPABASE_URL = "https://odxohvkwzqfkukxtiuxv.supabase.co";
export const Loader = () => <p className="loader">Loading...</p>;

export default function App() {
  const [query, setQuery] = useState("movie");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorage([], "watched");

  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useLocalStorage(null, "sessionId");

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchData = async () => {
      const { data } = await axios.get(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session}&select=*`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        },
      );
      if (data[0]) {
        setUserProfile(data[0]);
      } else {

        setSession(null);
        setUserProfile(null);
      }
    };
    fetchData();
  }, [session]);

  async function handleAddWatched(movie) {
    console.log(userProfile);
    const { data: freshProfile } = await axios.get(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );

    const currentProfile = freshProfile[0];
    const updatedMovies = [...(currentProfile.watched_movies || []), { movie }];

    await axios.patch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.id}`,
      {
        watched_movies: updatedMovies,
      },
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    setWatched((watched) => [...watched, movie]);
  }

  function handleMovieSelect(id) {
    selectedId === id ? setSelectedId(null) : setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  const addWatchedMovie = async (movie) => {};

  function handleRemoveWatched(e, id) {
    e.stopPropagation();
    setWatched((watched) => watched.filter((item) => item.imdbID !== id));
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
