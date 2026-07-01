export function ModeSwitch({ setMode, mode }) {
  return (
    <button className="btn-switch" onClick={() => setMode((mode) => !mode)}>
      {mode ? 'My Watchlist':'Watch history'}
    </button>
  );
}
