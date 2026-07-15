const selectMovie = async (request) => {
  const url = new URL(request.url);
  const movie_id = url.searchParams.get("i");

  try {
    const KEY = process.env.REELDB_KEY;
    const res = await fetch(
      `https://api.reeldb.io/omdb?apikey=${KEY}&i=${movie_id}`,
    );
    if (!res.ok) throw new Error("something went wrong with fetching");
    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
export default selectMovie;