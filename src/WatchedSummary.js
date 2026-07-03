import { average } from "./App";
import { ReactComponent as ImdbLogo } from "./assets/imdbLogo.svg";
export function WatchedSummary({ userMovies, mode }) {
  const avgImdbRating = average(userMovies.map((movie) => movie.imdbRating));
  const totalRuntime =
    userMovies.length > 0
      ? userMovies.reduce((acc, cur) => acc + cur.runtime, 0)
      : 0;

  return (
    <div className="summary">
      <h2>{mode ? "Watch history" : "My Watchlist"}</h2>
      <div>
        <p>
          <span>{userMovies.length} movies</span>
        </p>
        <p title="Internet Movie Database Rating">
          <ImdbLogo width='2.5vw'/>
          {avgImdbRating.toFixed(2)}
        </p>
        <p title="Total Watch time">
          <span>⏳</span>
          <span>{totalRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
