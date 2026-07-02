export function Navbar({ children, setQuery, setSelectedId }) {
  function handleLogoClick() {
    setQuery("");
    setSelectedId(null);
  }
  return (
    <nav className="nav-bar">
      <Logo onClick={handleLogoClick} />
      {children}
    </nav>
  );
}
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick}>
      <span role="img">🍿</span>
      <h1>Foxi Watchers</h1>
    </div>
  );
}
