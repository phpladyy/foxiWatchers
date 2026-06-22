export function MovieList({ movies, onMovieSelect }) {
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
