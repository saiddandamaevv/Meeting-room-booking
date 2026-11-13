import * as React from "react";
import { useState, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { createBooking } from "../../api/bookings";
import DatePickerField from "../DatePickerField/DatePickerField";
import TimeInputField from "../TimeInputField/TimeInputField";
import TimeSlotConflictDialog from "../TimeSlotConflictDialog/TimeSlotConflictDialog";
import { fromMskToUtc, TIMEZONE_MSK } from "../../utils/time";

dayjs.extend(utc);
dayjs.extend(timezone);

const inputStyle = {
  mt: 0.8,
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    fontSize: "0.95rem",
    color: "#1e293b",
    "& fieldset": {
      borderColor: "#e2e8f0",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0d9488",
      borderWidth: "1.5px",
    },
  },
  "& .MuiOutlinedInput-input": {
    py: 1.2,
    px: 1.8,
    "&::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
  },
};

const labelStyle = {
  fontWeight: 600,
  fontSize: "0.85rem",
  color: "#334155",
};

interface BookingsDialogProps {
  roomId: string;
  roomName?: string;
  officeName?: string;
  floor?: number | string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: Dayjs | string;
  initialTime?: string;
  initialDuration?: string;
  initialTitle?: string;
}

export default function BookingDialog({
  roomId,
  roomName = "Эверест",
  officeName = "Офис Москва",
  floor = 4,
  open,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  initialDuration,
  initialTitle,
}: BookingsDialogProps) {
  const initialSelectedDate = useMemo(() => {
    if (!initialDate) {
      return dayjs().tz(TIMEZONE_MSK);
    }

    if (typeof initialDate === "string") {
      return dayjs.tz(initialDate, TIMEZONE_MSK);
    }

    return initialDate.clone();
  }, [initialDate]);

  const [prevInitialValues, setPrevInitialValues] = useState({
    initialDate,
    initialTime,
    initialDuration,
  });

  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialSelectedDate);
  const [time, setTime] = useState(initialTime ?? "");
  const [userSelectedDuration, setUserSelectedDuration] = useState(initialDuration ?? "");
  const [loading, setLoading] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);

  if (
    prevInitialValues.initialDate !== initialDate ||
    prevInitialValues.initialTime !== initialTime ||
    prevInitialValues.initialDuration !== initialDuration
  ) {
    setPrevInitialValues({
      initialDate,
      initialTime,
      initialDuration,
    });
    setSelectedDate(initialSelectedDate);
    setTime(initialTime ?? "");
    setUserSelectedDuration(initialDuration ?? "");
  }

  const now = dayjs().tz(TIMEZONE_MSK);
  const isPastDate = selectedDate.startOf("day").isBefore(now.startOf("day"));
  const isToday = selectedDate.isSame(now, "day");

  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const selectedDateTime = dayjs.tz(
    `${selectedDate.format("YYYY-MM-DD")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
    TIMEZONE_MSK
  );

  const isPastTime = isToday && selectedDateTime.isBefore(now);
  const isDateTimeInvalid = isPastDate || isPastTime;

  const durationOptions = useMemo(() => {
    if (!time || !time.includes(":")) {
      return [];
    }

    const checkNow = dayjs().tz(TIMEZONE_MSK);
    const checkPastDate = selectedDate.startOf("day").isBefore(checkNow.startOf("day"));
    const checkToday = selectedDate.isSame(checkNow, "day");

    const [hNum = 0, mNum = 0] = time.split(":").map(Number);
    const checkDateTime = dayjs.tz(
      `${selectedDate.format("YYYY-MM-DD")}T${String(hNum).padStart(2, "0")}:${String(mNum).padStart(2, "0")}:00`,
      TIMEZONE_MSK
    );

    const checkPastTime = checkToday && checkDateTime.isBefore(checkNow);

    if (checkPastDate || checkPastTime) {
      return [];
    }

    const startTotalMinutes = hNum * 60 + mNum;
    const maxEndTotalMinutes = 20 * 60;
    const availableMinutes = maxEndTotalMinutes - startTotalMinutes;

    if (availableMinutes <= 0) {
      return [];
    }

    const options: { value: string; label: string; textOnly: string }[] = [];

    for (let m = 15; m <= availableMinutes; m += 15) {
      const endMinutesTotal = startTotalMinutes + m;
      const endH = String(Math.floor(endMinutesTotal / 60)).padStart(2, "0");
      const endM = String(endMinutesTotal % 60).padStart(2, "0");

      const h = Math.floor(m / 60);
      const minRemainder = m % 60;

      let textDuration: string;
      if (h > 0 && minRemainder > 0) {
        textDuration = `${h} ч ${minRemainder} мин`;
      } else if (h > 0) {
        textDuration = `${h} час${h === 1 ? "" : h < 5 ? "а" : "ов"}`;
      } else {
        textDuration = `${minRemainder} минут`;
      }

      options.push({
        value: String(m / 60),
        label: `${textDuration} (до ${endH}:${endM})`,
        textOnly: textDuration,
      });
    }

    return options;
  }, [time, selectedDate]);

  const effectiveDuration = (() => {
    if (durationOptions.length === 0) {
      return "";
    }
    const isValid = durationOptions.some((opt) => opt.value === userSelectedDuration);
    if (isValid) {
      return userSelectedDuration;
    }
    const fallback = durationOptions.find((opt) => opt.value === "1") || durationOptions[0];
    return fallback ? fallback.value : "";
  })();

  const durationHours = parseFloat(effectiveDuration) || 0;
  const startPreview = selectedDateTime;
  const endPreview = startPreview.add(durationHours * 60, "minute");

  const currentOption = durationOptions.find((opt) => opt.value === effectiveDuration);
  const durationLabel = currentOption ? currentOption.textOnly : "";

  let validationMessage = "";
  if (isPastDate) {
    validationMessage = "Нельзя забронировать переговорную на прошедшую дату";
  } else if (isPastTime) {
    validationMessage = "Нельзя выбрать время, которое уже прошло";
  } else if (!effectiveDuration) {
    validationMessage = "Выберите корректное время начала встречи (до 20:00)";
  }

  const isValidBooking = !isDateTimeInvalid && Boolean(effectiveDuration);

  const previewText = isValidBooking
    ? `Бронирование на ${startPreview
        .locale("ru")
        .format("dddd, D MMMM")
        .replace(/^./, (c) => c.toUpperCase())}, ${startPreview.format(
        "HH:mm"
      )} - ${endPreview.format("HH:mm")} (${durationLabel})`
    : validationMessage;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidBooking) return;

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") as string).trim();
    const rawComment = formData.get("comment") as string;
    const comment = rawComment?.trim() ? rawComment.trim() : undefined;

    try {
      const startsAt = selectedDateTime;
      const endsAt = startsAt.add(durationHours * 60, "minute");

      await createBooking({
        roomId,
        title,
        comment,
        startsAt: fromMskToUtc(startsAt),
        endsAt: fromMskToUtc(endsAt),
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number };
      };

      if (axiosError.response?.status === 409) {
        setIsConflictDialogOpen(true);
        return;
      }

      console.error("Ошибка при создании бронирования:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Dayjs) => {
    setSelectedDate(newDate);
    setIsConflictDialogOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    setIsConflictDialogOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            p: 3,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.12)",
          },
        },
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: "1.45rem",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            mb: 0.5,
          }}
        >
          Новое бронирование
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#64748b" }}>
          Переговорная:{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#0d9488" }}>
            {roomName}
          </Box>{" "}
          ({officeName}, {floor} этаж)
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#f1f5f9", mb: 2.5 }} />

      <DialogContent sx={{ p: 0 }}>
        <form onSubmit={handleSubmit} id="booking-form">
          <Typography sx={labelStyle}>Тема встречи *</Typography>
          <TextField
            required
            id="title"
            name="title"
            defaultValue={initialTitle ?? ""}
            fullWidth
            variant="outlined"
            sx={inputStyle}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelStyle}>Дата</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={handleDateChange}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelStyle}>Время начала</Typography>
              <TimeInputField
                value={time}
                onChange={handleTimeChange}
                onBlur={(finalTime: string) => {
                  setTime(finalTime);
                  setIsConflictDialogOpen(false);
                }}
              />
            </Box>
          </Box>

          <Typography sx={labelStyle}>Продолжительность</Typography>
          <TextField
            select
            id="duration"
            name="duration"
            value={effectiveDuration}
            disabled={!isValidBooking && durationOptions.length === 0}
            onChange={(e) => setUserSelectedDuration(e.target.value)}
            fullWidth
            variant="outlined"
            sx={inputStyle}
            slotProps={{
              select: {
                displayEmpty: true,
                IconComponent: KeyboardArrowDownRoundedIcon,
                sx: {
                  "& .MuiSelect-icon": {
                    color: "#475569",
                    right: 12,
                  },
                },
              },
            }}
          >
            {durationOptions.length === 0 ? (
              <MenuItem value="">Недоступно</MenuItem>
            ) : (
              durationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            )}
          </TextField>

          <Typography sx={labelStyle}>Комментарий</Typography>
          <TextField
            id="comment"
            name="comment"
            placeholder="Дополнительная информация для участников встречи..."
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            sx={inputStyle}
          />
        </form>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            mt: 0.5,
            mb: 2.5,
            borderRadius: "10px",
            bgcolor: isValidBooking ? "#dcfce7" : "#fee2e2",
            border: "1.5px solid",
            borderColor: isValidBooking ? "#22c55e" : "#ef4444",
            color: isValidBooking ? "#166534" : "#991b1b",
          }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 20, color: isValidBooking ? "#0d9488" : "#dc2626" }}
          />
          <Typography
            sx={{
              fontSize: "0.825rem",
              fontWeight: 500,
              color: isValidBooking ? "#0f766e" : "#b91c1c",
            }}
          >
            {previewText}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 0, justifyContent: "flex-end", gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            px: 3,
            py: 1.1,
            borderRadius: "10px",
            color: "#475569",
            borderColor: "#e2e8f0",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          form="booking-form"
          variant="contained"
          disabled={loading || !isValidBooking}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            px: 3,
            py: 1.1,
            borderRadius: "10px",
            bgcolor: "#0d9488",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#0f766e",
              boxShadow: "none",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Забронировать"
          )}
        </Button>
      </DialogActions>

      <TimeSlotConflictDialog
        open={isConflictDialogOpen}
        onClose={() => setIsConflictDialogOpen(false)}
      />
    </Dialog>
  );
}