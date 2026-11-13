import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";

interface DatePickerFieldProps {
  value: Dayjs;
  onChange: (date: Dayjs) => void;
}

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(value.startOf("month"));

  const today = dayjs().startOf("day");
  const maxDate = today.add(30, "day").endOf("day");

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setCurrentMonth(value.startOf("month"));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"));
  };

  const generateDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");

    const startDayOfWeek = (startOfMonth.day() + 6) % 7;
    const startDate = startOfMonth.subtract(startDayOfWeek, "day");

    const days: Dayjs[] = [];
    let curr = startDate;

    const totalSlots = startDayOfWeek + endOfMonth.date() > 35 ? 42 : 35;
    for (let i = 0; i < totalSlots; i++) {
      days.push(curr);
      curr = curr.add(1, "day");
    }
    return days;
  };

  const daysGrid = generateDays();
  const open = Boolean(anchorEl);

  return (
    <Box>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          px: 1.8,
          py: 1.2,
          mt: 0.8,
          mb: 2,
          border: "1.5px solid",
          borderColor: open ? "#0d9488" : "#e2e8f0",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": {
            borderColor: open ? "#0d9488" : "#cbd5e1",
          },
        }}
      >
        <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "#475569" }} />
        <Typography sx={{ fontSize: "0.95rem", color: "#1e293b" }}>
          {value.locale("ru").format("D MMMM, dd")}
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2.5,
              width: 320,
              borderRadius: "20px",
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.12)",
              border: "1px solid #f1f5f9",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a" }}>
            {currentMonth.locale("ru").format("MMMM YYYY").replace(/^./, (c) => c.toUpperCase())}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handlePrevMonth}
              sx={{
                bgcolor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #f1f5f9",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20, color: "#475569" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextMonth}
              sx={{
                bgcolor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #f1f5f9",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 20, color: "#475569" }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1, textAlign: "center" }}>
          {WEEK_DAYS.map((wd) => (
            <Typography key={wd} sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>
              {wd}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 0.8, columnGap: 0.4 }}>
          {daysGrid.map((dayItem) => {
            const isCurrentMonth = dayItem.month() === currentMonth.month();
            const isSelected = dayItem.isSame(value, "day");
            
            const isDisabled = dayItem.isBefore(today, "day") || dayItem.isAfter(maxDate, "day");

            return (
              <Box
                key={dayItem.format("YYYY-MM-DD")}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(dayItem);
                    handleClose();
                  }
                }}
                sx={{
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: isSelected ? 700 : 500,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  bgcolor: isSelected ? "#0d9488" : "transparent",
                  color: isSelected
                    ? "#ffffff"
                    : isDisabled
                    ? "#cbd5e1"
                    : !isCurrentMonth
                    ? "#94a3b8"
                    : "#1e293b",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isSelected ? "#0d9488" : isDisabled ? "transparent" : "#f1f5f9",
                  },
                }}
              >
                {dayItem.date()}
              </Box>
            );
          })}
        </Box>

        <Typography sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid #f8fafc", fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4 }}>
          Ограничение: не более 30 дней вперёд. Даты за пределами лимита неактивны.
        </Typography>
      </Popover>
    </Box>
  );
}