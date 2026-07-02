import supabase from "./supabaseClient.mjs";

const editColumn = async (req) => {
  const { session, movieArray, column } = await req.json();
  const { error } = await supabase
    .from("profiles")
    .update({ [column]: movieArray })
    .eq("id", session);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
};

export default editColumn;
