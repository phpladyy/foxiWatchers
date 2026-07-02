export async function updateTable(session, movieArray, operation, column) {
  const res = await fetch(`/.netlify/functions/${operation}`, {
    method: "POST",
    body: JSON.stringify({ session, movieArray, column }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}
