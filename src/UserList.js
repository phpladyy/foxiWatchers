export function UserList({
  watched,
  onRemoveWatched,
  onRemoveWatchlist,
  onMovieSelect,
  mode,
}) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedItem
          mode={mode}
          key={movie.imdbID}
          movie={movie}
          onRemoveWatchlist={onRemoveWatchlist}
          onRemoveWatched={onRemoveWatched}
          handleMovieSelect={onMovieSelect}
        />
      ))}
    </ul>
  );
}
function WatchedItem({
  movie,
  onRemoveWatchlist,
  onRemoveWatched,
  addWatchlist,
  handleMovieSelect,
  mode,
}) {
  function handleRemove(e, id) {
    mode ? onRemoveWatched(e, id) : onRemoveWatchlist(e, id);
  }
  console.log(movie);
  return (
    <li onClick={() => handleMovieSelect(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        {mode ? (
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
        ) : (
          <p>
            <span>📅</span>
            <span>{movie.year}</span>
          </p>
        )}
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <p>
          <button
            className="btn-delete"
            onClick={(e) => handleRemove(e, movie.imdbID)}
          >
            &times;
          </button>
        </p>
      </div>
    </li>
  );
}
