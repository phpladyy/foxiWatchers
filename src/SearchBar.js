import { useEffect } from "react";

export function SearchBar({ query, setQuery }) {

  useEffect(()=>{
    const searchBar = document.querySelector('.search');
    searchBar.focus();
  },[]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
