import { useState, useEffect, useRef } from "react";
import { KEY, Loader } from "./App";
import StarRating from "./StarRating";
import { useKeyPress } from "./useKeyPress";
import axios from "axios";
import { SUPABASE_KEY } from "./App";
import { SUPABASE_URL } from "./App";

export function SelectedMovie({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
  userProfile
}) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isWatched = watched.map((item) => item.imdbID).includes(selectedId);
  const url = `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`;

  const countRef = useRef(0);
  useEffect(() => {
    if (userRating) {
      countRef.current = countRef.current + 1;
    }
  }, [userRating]);

  const userRate = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;



  function handleAdd() {
    const newWatchedMovie = {
      userRating,
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      countRatingChanges: countRef.current,
    };
    
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

useKeyPress('Escape', onCloseMovie);

  // fetching selected movie details
  useEffect(() => {
    async function getDetails() {
      setIsLoading(true);
      const detailsRaw = await fetch(url);
      const movieDetails = await detailsRaw.json();
      setMovie((movie) => movieDetails);
      setIsLoading(false);
    }
    getDetails();
  }, [url]);

  //web page title changer
  useEffect(() => {
    document.title = title ? title : "Loading...";
    //resetting title on onmount
    return () => {
      document.title = "Foxie's Watchlist";
    };
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &times;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &sdot; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    size={4}
                    maxRating={10}
                    onsetUserRating={setUserRating}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to watched-list
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this movie {userRate} stars</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Directed by: {director}</p>
            <p>Actors: {actors}</p>
          </section>
        </>
      )}
    </div>
  );
}
