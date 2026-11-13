import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header/Header";
import OfficeCard from "../../components/OfficeCard/OfficeCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import PeopleIcon from "@mui/icons-material/People";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { getRooms } from "../../api/rooms";
import OfficeSelector from "../../components/OfficeSelector/OfficeSelector";
import { useSearchParams } from "react-router-dom";
import DatePickerField from "../../components/DatePickerField/DatePickerField";
import TimeInputField from "../../components/TimeInputField/TimeInputField";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { fromMskToUtc, TIMEZONE_MSK } from "../../utils/time";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface OfficeRoom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  available: boolean;
}

const STORAGE_KEY_OFFICE = "selected_office_id";
const STORAGE_KEY_FILTERS = "rooms_filters";

const SKELETON_CARDS_COUNT = 4;

const skeletonBlockSx = {
  borderRadius: 1,
  bgcolor: "#e2e8f0",
};

function RoomCardSkeleton() {
  return (
    <Box
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        backgroundColor: "#f8fafc",
        p: 2,
        height: "100%",
      }}
    >
      <Skeleton variant="rectangular" width={96} height={16} sx={{ ...skeletonBlockSx, mb: 1 }} />
      <Skeleton variant="rectangular" width={36} height={10} sx={{ ...skeletonBlockSx, mb: 2 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <Skeleton variant="circular" width={10} height={10} sx={{ bgcolor: "#e2e8f0" }} />
        <Skeleton variant="rectangular" width={140} height={10} sx={skeletonBlockSx} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <Skeleton variant="circular" width={10} height={10} sx={{ bgcolor: "#e2e8f0" }} />
        <Skeleton variant="rectangular" width={140} height={10} sx={skeletonBlockSx} />
      </Stack>

      <Skeleton variant="rectangular" width="100%" height={22} sx={{ ...skeletonBlockSx, mb: 1 }} />

      <Stack direction="row" spacing={1}>
        <Skeleton variant="rectangular" width="50%" height={22} sx={skeletonBlockSx} />
        <Skeleton variant="rectangular" width="50%" height={22} sx={skeletonBlockSx} />
      </Stack>
    </Box>
  );
}

const filterLabelStyle = {
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  color: "#94a3b8",
  textTransform: "uppercase",
  mb: 0.5,
};

const filterFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 42,
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    fontSize: "0.875rem",
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
    py: 0,
    px: 1.5,
  },
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<OfficeRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const officeId = searchParams.get("officeId");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const durationParam = searchParams.get("duration");
  const capacityParam = searchParams.get("capacity");

  const [prevTimeParam, setPrevTimeParam] = useState(timeParam);
  const [localTime, setLocalTime] = useState(timeParam || "");

  if (timeParam !== prevTimeParam) {
    setPrevTimeParam(timeParam);
    setLocalTime(timeParam || "");
  }

  const selectedDate: Dayjs | null = useMemo(() => {
    return dateParam && dayjs.tz(dateParam, TIMEZONE_MSK).isValid()
      ? dayjs.tz(dateParam, TIMEZONE_MSK)
      : null;
  }, [dateParam]);

  const selectedTime = timeParam || "";
  const selectedDuration = durationParam || "";
  const selectedCapacity = capacityParam || "";

  const durationOptions = useMemo(() => {
    if (!selectedTime || !selectedTime.includes(":")) {
      return [];
    }

    const [hours = 0, minutes = 0] = selectedTime.split(":").map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const maxEndTotalMinutes = 20 * 60;
    const availableMinutes = maxEndTotalMinutes - startTotalMinutes;

    if (availableMinutes <= 0) {
      return [];
    }

    const options: { value: string; label: string }[] = [];

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
      });
    }

    return options;
  }, [selectedTime]);

  const hasActiveFilters = Boolean(
    selectedTime || selectedDuration || selectedCapacity,
  );

  const updateFilters = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });

    setSearchParams(nextParams);

    const currentSaved = sessionStorage.getItem(STORAGE_KEY_FILTERS);
    const filtersObj = currentSaved ? JSON.parse(currentSaved) : {};

    Object.entries(updates).forEach(([key, val]) => {
      if (key === "officeId") {
        if (val) sessionStorage.setItem(STORAGE_KEY_OFFICE, val);
        else sessionStorage.removeItem(STORAGE_KEY_OFFICE);
      } else {
        if (val === null || val === "") delete filtersObj[key];
        else filtersObj[key] = val;
      }
    });

    sessionStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filtersObj));
  };

  useEffect(() => {
    const savedOfficeId = sessionStorage.getItem(STORAGE_KEY_OFFICE);
    const savedFiltersRaw = sessionStorage.getItem(STORAGE_KEY_FILTERS);
    const savedFilters = savedFiltersRaw ? JSON.parse(savedFiltersRaw) : {};

    const newParams = new URLSearchParams(searchParams);
    let changed = false;

    const targetOfficeId = officeId || savedOfficeId;
    if (targetOfficeId && !officeId) {
      newParams.set("officeId", targetOfficeId);
      changed = true;
    }

    if (!dateParam && savedFilters.date) {
      newParams.set("date", savedFilters.date);
      changed = true;
    }

    if (!timeParam && savedFilters.time) {
      newParams.set("time", savedFilters.time);
      changed = true;
    }

    if (!durationParam && savedFilters.duration) {
      newParams.set("duration", savedFilters.duration);
      changed = true;
    }

    if (!capacityParam && savedFilters.capacity) {
      newParams.set("capacity", savedFilters.capacity);
      changed = true;
    }

    if (changed) {
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (selectedTime && durationOptions.length > 0 && !selectedDuration) {
      const defaultOption =
        durationOptions.find((opt) => opt.value === "1") || durationOptions[0];
      updateFilters({ duration: defaultOption.value });
      return;
    }

    if (durationOptions.length === 0) {
      if (selectedDuration) {
        updateFilters({ duration: null });
      }
      return;
    }

    const exists = durationOptions.some((opt) => opt.value === selectedDuration);
    if (!exists && selectedDuration) {
      const defaultOption =
        durationOptions.find((opt) => opt.value === "1") || durationOptions[0];
      updateFilters({ duration: defaultOption.value });
    }
  }, [durationOptions, selectedDuration, selectedTime]);

  useEffect(() => {
    let isMounted = true;

    const fetchRooms = async () => {
      try {
        if (!officeId) {
          setRooms([]);
          return;
        }

        setRoomsLoading(true);

        const minCapacity = selectedCapacity
          ? Number(selectedCapacity)
          : undefined;
        let from: string | undefined = undefined;
        let to: string | undefined = undefined;

        if (selectedDate && selectedTime && selectedDuration) {
          const [hours = 0, minutes = 0] = selectedTime.split(":").map(Number);
          const dateStr = selectedDate.format("YYYY-MM-DD");
          const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

          const startsAt = dayjs.tz(`${dateStr}T${timeStr}`, TIMEZONE_MSK);
          const endsAt = startsAt.clone().add(parseFloat(selectedDuration) * 60, "minute");

          from = fromMskToUtc(startsAt);
          to = fromMskToUtc(endsAt);
        }

        const roomsData = await getRooms(officeId, minCapacity, from, to);
        if (isMounted) {
          setRooms(roomsData.items ?? []);
        }
      } catch (error) {
        console.error("Failed to load rooms:", error);
        if (isMounted) {
          setRooms([]);
        }
      } finally {
        if (isMounted) {
          setRoomsLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, [
    officeId,
    selectedDate,
    selectedTime,
    selectedDuration,
    selectedCapacity,
  ]);

  const emptyMessage = useMemo(() => {
    if (!officeId) {
      return "Выберите офис, чтобы увидеть доступные переговорные";
    }
    if (hasActiveFilters) {
      return "По выбранным фильтрам нет доступных переговорных. Попробуйте изменить время, дату или вместимость";
    }
    return "В этом офисе пока нет доступных переговорных";
  }, [officeId, hasActiveFilters]);

  return (
    <div className="OfficesPage">
      <Header />
      <OfficeSelector
        value={officeId || ""}
        onChange={(newOfficeId) => updateFilters({ officeId: newOfficeId })}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography sx={filterLabelStyle}>Дата</Typography>
            <DatePickerField
              value={selectedDate || dayjs().tz(TIMEZONE_MSK)}
              onChange={(newDate: Dayjs) =>
                updateFilters({ date: newDate.format("YYYY-MM-DD") })
              }
            />
          </Box>

          <Box sx={{ width: 130 }}>
            <Typography sx={filterLabelStyle}>Время начала</Typography>
            <TimeInputField
              required={false}
              value={localTime}
              onChange={setLocalTime}
              onBlur={(finalTime) => updateFilters({ time: finalTime })}
            />
          </Box>

          <Box sx={{ width: 190 }}>
            <Typography sx={filterLabelStyle}>Длительность</Typography>
            <TextField
              select
              id="duration"
              name="duration"
              value={selectedDuration}
              disabled={durationOptions.length === 0}
              onChange={(e) => updateFilters({ duration: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{ ...filterFieldSx, mt: 0.8, mb: 2 }}
              slotProps={{
                select: {
                  displayEmpty: true,
                  IconComponent: KeyboardArrowDownRoundedIcon,
                  sx: {
                    "& .MuiSelect-icon": {
                      color: "#64748b",
                      right: 8,
                    },
                  },
                },
              }}
            >
              <MenuItem value="">Не выбрано</MenuItem>
              {durationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: 170 }}>
            <Typography sx={filterLabelStyle}>Вместимость</Typography>
            <TextField
              select
              value={selectedCapacity}
              onChange={(e) => updateFilters({ capacity: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{ ...filterFieldSx, mt: 0.8, mb: 2 }}
              slotProps={{
                select: {
                  displayEmpty: true,
                  IconComponent: KeyboardArrowDownRoundedIcon,
                  sx: {
                    "& .MuiSelect-icon": {
                      color: "#64748b",
                      right: 8,
                    },
                  },
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.8 }}>
                      <PeopleIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">Все варианты</MenuItem>
              <MenuItem value="4">Мин. 4 чел.</MenuItem>
              <MenuItem value="6">Мин. 6 чел.</MenuItem>
              <MenuItem value="8">Мин. 8 чел.</MenuItem>
              <MenuItem value="12">Мин. 12 чел.</MenuItem>
            </TextField>
          </Box>
        </Box>

        {roomsLoading ? (
          <>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#0f172a",
                mb: 2,
              }}
            >
              Загрузка переговорных…
            </Typography>

            <Grid container spacing={3}>
              {Array.from({ length: SKELETON_CARDS_COUNT }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <RoomCardSkeleton />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
                mb: 3,
              }}
            >
              Доступные переговорные в этом офисе
            </Typography>

            {rooms.length === 0 ? (
              <Typography
                sx={{
                  color: "#64748b",
                  py: 6,
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              >
                {emptyMessage}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {rooms.map((room) => (
                  <Grid key={room.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <OfficeCard
                      id={room.id}
                      name={room.name}
                      floor={room.floor}
                      capacity={room.capacity}
                      available={room.available ?? true}
                      selectedDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </div>
  );
}