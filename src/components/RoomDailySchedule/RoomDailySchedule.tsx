import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import DatePickerField from "../DatePickerField/DatePickerField";
import { fromUtcToMsk, TIMEZONE_MSK } from "../../utils/time";

export interface BookingItem {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  isMyBooking?: boolean;
}

interface RoomDailyScheduleProps {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  bookings: BookingItem[];
  onCreateBooking?: () => void;
}

const START_HOUR = 9;
const END_HOUR = 20;
const HOUR_HEIGHT = 56;
const HOURS_COUNT = END_HOUR - START_HOUR;
const TOTAL_MINUTES = HOURS_COUNT * 60;
const TOTAL_GRID_HEIGHT = HOURS_COUNT * HOUR_HEIGHT;

const hoursArray = Array.from({ length: HOURS_COUNT + 1 }, (_, i) => START_HOUR + i);

export default function RoomDailySchedule({
  selectedDate,
  onDateChange,
  bookings = [],
  onCreateBooking,
}: RoomDailyScheduleProps) {
  const currentDate = selectedDate.tz(TIMEZONE_MSK);

  const formattedDateTitle = currentDate
    .locale("ru")
    .format("dddd, D MMMM")
    .replace(/^./, (c) => c.toUpperCase());

  const dayBookings = React.useMemo(() => {
    return bookings
      .filter((b) => fromUtcToMsk(b.startsAt).isSame(currentDate, "day"))
      .map((b) => {
        const start = fromUtcToMsk(b.startsAt);
        const end = fromUtcToMsk(b.endsAt);

        const startMinutes = (start.hour() - START_HOUR) * 60 + start.minute();
        const endMinutes = (end.hour() - START_HOUR) * 60 + end.minute();

        const clampedStart = Math.max(0, Math.min(startMinutes, TOTAL_MINUTES));
        const clampedEnd = Math.max(0, Math.min(endMinutes, TOTAL_MINUTES));

        const duration = clampedEnd - clampedStart;
        if (duration <= 0) return null;

        const top = (clampedStart / TOTAL_MINUTES) * TOTAL_GRID_HEIGHT;
        const height = (duration / TOTAL_MINUTES) * TOTAL_GRID_HEIGHT;

        return {
          ...b,
          top,
          height,
        };
      })
      .filter(Boolean) as (BookingItem & { top: number; height: number })[];
  }, [bookings, currentDate]);

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        border: "1.5px solid #f1f5f9",
        p: { xs: 2.5, md: 4 },
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.35rem",
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Расписание на день
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "0.875rem", mt: 0.3 }}>
            {formattedDateTitle}
          </Typography>
        </Box>

        <Box sx={{ width: 170 }}>
          <DatePickerField
            value={currentDate}
            onChange={onDateChange}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", position: "relative", my: 2, height: TOTAL_GRID_HEIGHT + 20 }}>
        <Box
          sx={{
            width: 56,
            flexShrink: 0,
            position: "relative",
            height: TOTAL_GRID_HEIGHT,
          }}
        >
          {hoursArray.map((hour, idx) => (
            <Typography
              key={hour}
              sx={{
                position: "absolute",
                top: idx * HOUR_HEIGHT,
                transform: "translateY(-50%)",
                fontSize: "0.75rem",
                color: "#94a3b8",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {String(hour).padStart(2, "0")}:00
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            height: TOTAL_GRID_HEIGHT,
          }}
        >
          {hoursArray.map((hour, idx) => (
            <Box
              key={hour}
              sx={{
                position: "absolute",
                top: idx * HOUR_HEIGHT,
                left: 0,
                right: 0,
                borderTop: "1px solid #f1f5f9",
              }}
            />
          ))}

          {dayBookings.map((b) => {
            return (
              <Box
                key={b.id}
                sx={{
                  position: "absolute",
                  top: b.top + 1,
                  height: b.height - 2,
                  left: 6,
                  right: 0,
                  borderRadius: "8px",
                  backgroundColor: "#ccfbf1",
                  border: "1px solid",
                  borderColor: "#0d9488",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  zIndex: 2,
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#0f766e",
                  }}
                >
                  {b.title}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
        <Button
          variant="contained"
          onClick={onCreateBooking}
          disabled={!onCreateBooking}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: "12px",
            px: 2.5,
            py: 1.2,
            bgcolor: "#0d9488",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#0f766e",
              boxShadow: "none",
            },
          }}
        >
          Забронировать
        </Button>
      </Box>
    </Box>
  );
}