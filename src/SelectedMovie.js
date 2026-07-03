import { useState, useEffect } from "react";
import { Loader } from "./App";
import StarRating from "./StarRating";
import { useKeyPress } from "./useKeyPress";
import { CriticRatings } from "./CriticRatings";

export function SelectedMovie({
  selectedId,
  onCloseMovie,
  onAddMovie,
  watched,
  watchlist,
  setWatchlist,
  userProfile,
  onRemoveListItem,
}) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isWatched = watched.map((item) => item.imdbID).includes(selectedId);
  const isWatchlisted = watchlist
    .map((item) => item.imdbID)
    .includes(selectedId);

  const userRate = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Rated: pegi,
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Ratings: ratings,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const rottenTomatoesRating = ratings?.[1]?.Value;
  const metacriticRating = ratings?.[2]?.Value;
  //for appending to watched and watchlist column
  const handleAdd = async (list) => {
    const newMovie = {
      pegi,
      userRating,
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      rottenTomatoesRating,
      metacriticRating,
      runtime: Number(runtime.split(" ").at(0)),
    };
    onAddMovie(newMovie, list);
    onCloseMovie();
  };

  useKeyPress("Escape", onCloseMovie);

  // fetching selected movie details
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    async function getDetails() {
      try {
        const detailsRaw = await fetch(
          `/.netlify/functions/selectMovie?i=${selectedId}`,
          { signal: controller.signal },
        );
        if (!detailsRaw.ok)
          throw new Error("something went wrong with fetching");
        const movieDetails = await detailsRaw.json();

        if (movieDetails.Response === "False")
          throw new Error("Movie not found");
        setMovie((movie) => movieDetails);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }
    setIsLoading(true);
    getDetails();
    return () => controller.abort();
  }, [selectedId]);

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
                {released} &sdot; {runtime} &sdot; {pegi}
              </p>
              <p>{genre}</p>
              <CriticRatings
                imdbRating={imdbRating}
                rottenTomatoesRating={rottenTomatoesRating}
                metacriticRating={metacriticRating}
              />
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
                    <button
                      className="btn-add"
                      onClick={() => handleAdd("watched")}
                    >
                      Add to Watch History
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this movie {userRate} stars</p>
              )}
              {!isWatched && !userRating && !isWatchlisted && (
                <button
                  className="btn-add"
                  onClick={() => handleAdd("watch_list")}
                >
                  Add to Watchlist
                </button>
              )}
              {isWatchlisted && (
                <button
                  className="btn-add"
                  onClick={(e) =>
                    onRemoveListItem(e, selectedId, watchlist, setWatchlist)
                  }
                >
                  Remove from Watchlist
                </button>
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
