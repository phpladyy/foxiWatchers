import { useState, useEffect } from "react";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `/.netlify/functions/searchMovies?q=${query}`,
            { signal: controller.signal },
          );

          if (!res.ok) throw new Error("something went wrong with fetching");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          console.log(data);
          setMovies(data?.Search || [data]);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
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
