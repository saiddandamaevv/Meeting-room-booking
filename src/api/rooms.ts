import server from "./server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Dayjs } from "dayjs";
import { TIMEZONE_MSK } from "../utils/time";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getRooms(
  officeId: string,
  minCapacity?: number,
  from?: string,
  to?: string
) {
  const { data } = await server.get("/rooms", {
    params: {
      officeId,
      minCapacity,
      from,
      to,
    },
  });
  return data;
}

export async function getRoomById(roomId: string) {
  const { data } = await server.get(`/rooms/${roomId}`);
  return data;
}

export async function getRoomBookings(roomId: string, date: string | Dayjs) {
  const formattedDate = typeof date === "string" ? date : date.format("YYYY-MM-DD");

  const dayStart = dayjs.tz(formattedDate, "YYYY-MM-DD", TIMEZONE_MSK).startOf("day");
  const dayEnd = dayjs.tz(formattedDate, "YYYY-MM-DD", TIMEZONE_MSK).endOf("day");

  const from = dayStart.utc().toISOString();
  const to = dayEnd.utc().toISOString();

  const { data } = await server.get(`/rooms/${roomId}/bookings`, {
    params: {
      from,
      to,
    },
  });
  return data;
}