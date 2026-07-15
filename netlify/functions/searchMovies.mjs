const searchMovies = async (request) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "movie";

  if (!query) {
    return new Response(JSON.stringify({ error: "empty query" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const KEY = process.env.OMDB_KEY;
    const res = await fetch(
      query.length > 2
        ? `https://www.omdbapi.com/?s=${query}*&apikey=${KEY}`
        : `https://www.omdbapi.com/?t=${query}&apikey=${KEY}`,
    );
    if (!res.ok) throw new Error("something went wrong with fetching");
    const data = await res.json();

    return Response.json(data, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
export default searchMovies;
