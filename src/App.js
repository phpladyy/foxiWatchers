import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { WatchedSummary } from "./WatchedSummary";
import { UserList } from "./UserList";
import { MovieList } from "./MovieList";
import { Navbar } from "./Navbar";
import { SelectedMovie } from "./SelectedMovie";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { ModeSwitch } from "./ModeSwitch";
import { Login } from "./Login";
import { updateTable } from "./updateTable";
import { UserTab } from "./UserTab";
import { fetchData } from "./fetchData";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
export const KEY = process.env.REACT_APP_KEY;
export const Loader = () => <p className="loader">Loading...</p>;

export default function App() {
  const [mode, setMode] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useLocalStorage(null, "sessionId");
  const [mobileHide, setMobileHide] = useState("hiddenSearchPanel");
  const [returnPanel, setReturnPanel] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchUserData = async () => {
      const data = await fetchData(session, "/.netlify/functions/getProfile");
      if (data) {
        setUserProfile(data);
        setWatched(data.watched_movies);
        setWatchlist(data.watch_list);
      } else {
        setSession(null);
        setUserProfile(null);
      }
    };
    fetchUserData();
  }, [session, setSession]);

  async function handleAddMovie(movie, list) {
    const promises = [];
    if (list === "watched") {
      const updatedWatchlist = watchlist.filter(
        (item) => item.imdbID !== movie.imdbID,
      );
      setWatchlist(updatedWatchlist);
      promises.push(updateTable(session, updatedWatchlist, "watch_list"));
    }
    const setColumn = list === "watched" ? setWatched : setWatchlist;
    const column = list === "watched" ? watched : watchlist;
    const update = [...column, movie];
    setColumn(update);
    const dbColumn = list === "watched" ? "watched_movies" : "watch_list";
    promises.push(updateTable(session, update, dbColumn));
    await Promise.all(promises);
  }

  async function handleRemoveListItem(e, id, list, setList) {
    e.stopPropagation();
    const update = list.filter((item) => item.imdbID !== id);
    setList(update);

    const dbColumn = mode ? "watched_movies" : "watch_list";
    await updateTable(session, update, dbColumn);
  }

  function handleMovieSelect(id) {
    selectedId === id ? setSelectedId(null) : setSelectedId(id);
    if (!selectedId) {
      setReturnPanel(mobileHide);
    }
    setMobileHide("hiddenSearchPanel");
  }

  function handleCloseMovie() {
    setSelectedId(null);
    setMobileHide(returnPanel);
  }

  return (
    <>
      {!session ? (
        <Login setUserProfile={setUserProfile} setSession={setSession} />
      ) : (
        <>
          <Navbar setSelectedId={setSelectedId} setQuery={setQuery}>
            <SearchBar
              onClick={() => setMobileHide("hiddenUserList")}
              query={query}
              setQuery={setQuery}
            />
            <ModeSwitch
              setMode={setMode}
              mode={mode}
              onClick={() => setMobileHide("hiddenSearchPanel")}
            />
            <UserTab
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setSession={setSession}
            />
          </Navbar>
          <Main>
            <Panel
              className={mobileHide === "hiddenSearchPanel" ? "hidden" : ""}
            >
              <div className={selectedId ? "hidden" : ""}>
                {isLoading && <Loader />}
                {!isLoading && !error && (
                  <MovieList
                    movies={movies}
                    onMovieSelect={handleMovieSelect}
                  />
                )}
                {error && <ErrorMessage message={error} />}
              </div>
            </Panel>
            <Panel className={mobileHide === "hiddenUserList" ? "hidden" : ""}>
              {selectedId ? (
                <SelectedMovie
                  onRemoveListItem={handleRemoveListItem}
                  userProfile={userProfile}
                  key={selectedId}
                  selectedId={selectedId}
                  onCloseMovie={handleCloseMovie}
                  onAddMovie={handleAddMovie}
                  watched={watched}
                  watchlist={watchlist}
                  setWatchlist={setWatchlist}
                />
              ) : (
                <>
                  <WatchedSummary
                    userMovies={mode ? watched : watchlist}
                    mode={mode}
                  />
                  <UserList
                    mode={mode}
                    list={mode ? watched : watchlist}
                    setList={mode ? setWatched : setWatchlist}
                    onRemoveListItem={handleRemoveListItem}
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
const Main = ({ children }) => <main className="main">{children}</main>;
function Panel({ children, className }) {
  return <div className={`box ${className}`}>{children}</div>;
}
