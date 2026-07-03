import { useState } from "react";

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
  const [imageStatus, setImageStatus] = useState(true);
  if (!imageStatus) {
    return;
  }
  console.log(movie);
  return (
    <li onClick={() => handleMovieSelect(movie.imdbID)}>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
        onError={(e) => setImageStatus(false)}
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
