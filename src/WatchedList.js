export function WatchedList({ watched, onRemoveWatched, onMovieSelect }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedItem
          key={movie.imdbID}
          movie={movie}
          onRemoveWatched={onRemoveWatched}
          handleMovieSelect={onMovieSelect}
        />
      ))}
    </ul>
  );
}
function WatchedItem({ movie, onRemoveWatched, handleMovieSelect }) {
  return (
    <li onClick={() => handleMovieSelect(movie.imdbID)}>
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
        <p>
          <button
            className="btn-delete"
            onClick={(e) => onRemoveWatched(e,movie.imdbID)}
          >
            &times;
          </button>
        </p>
      </div>
    </li>
  );
}
