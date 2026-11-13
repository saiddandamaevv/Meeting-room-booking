import server from "./server";

export interface CreateBookingPayload {
  roomId: string;
  title: string;
  comment?: string;
  startsAt: string;
  endsAt: string;
}

export async function getBookings(scope: string, officeId?: string) {
  const { data } = await server.get("/bookings", {
    params: {
      scope,
      officeId
    },
  });
  return data;
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await server.post("/bookings", payload);
  return data;
}

export async function cancelBooking(id: string) {
  const { data } = await server.delete(`/bookings/${id}`);
  return data;
}