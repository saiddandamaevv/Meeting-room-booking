import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE_MSK = "Europe/Moscow";

export function fromUtcToMsk(value: string | Date) {
  return dayjs.utc(value).tz(TIMEZONE_MSK);
}

export function fromMskToUtc(value: dayjs.Dayjs) {
  return value.clone().tz(TIMEZONE_MSK).utc().toISOString();
}
