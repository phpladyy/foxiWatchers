import { useState, useEffect } from "react";
import { KEY } from "./App";
export function useMovies(query, callback) {

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
        callback?.();
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            //for counting shows runtime handy query
            //https://www.omdbapi.com/?apikey=4e376efd&i=tt3107288&episodes?&season=1
            `http://www.omdbapi.com/?s=${query}&&apikey=${KEY}`,
            { signal: controller.signal },
          );

          if (!res.ok) throw new Error("something went wrong with fetching");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query],
  );
  return { movies, isLoading, error };
}
