import server from "./server";

export async function getOffices() {
  const { data } = await server.get("/offices");
  return data;
}