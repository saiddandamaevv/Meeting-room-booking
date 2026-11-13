import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import BookingCard from "../../components/BookingCard/BookingCard";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import "dayjs/locale/ru";
import { getBookings } from "../../api/bookings";
import { getOffices } from "../../api/offices";
import { fromUtcToMsk } from "../../utils/time";
import { useBookingRealtime } from "../../hooks/useBookingRealtime";

export interface Booking {
  id: string;
  title: string;
  roomName?: string;
  startsAt: string;
  endsAt: string;
  room?: {
    name: string;
    floor: number;
  };
}

interface OfficeOption {
  id: string;
  name: string;
}

type BookingsTab = "upcoming" | "past";

const isBookingsTab = (value: string | null): value is BookingsTab =>
  value === "upcoming" || value === "past";

const STORAGE_KEY_OFFICE = "bookings_office_id";

const SKELETON_CARDS_COUNT = 2;

const skeletonBlockSx = {
  borderRadius: 1,
  bgcolor: "#e2e8f0",
};

function BookingCardSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        p: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        width={56}
        height={56}
        sx={{ ...skeletonBlockSx, borderRadius: "8px", flexShrink: 0 }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="rectangular" width="45%" height={14} sx={{ ...skeletonBlockSx, mb: 1.25 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="rectangular" width={70} height={10} sx={skeletonBlockSx} />
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
          <Skeleton variant="rectangular" width={50} height={10} sx={skeletonBlockSx} />
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
          <Skeleton variant="rectangular" width={120} height={10} sx={skeletonBlockSx} />
        </Box>
      </Box>

      <Skeleton
        variant="rectangular"
        width={88}
        height={32}
        sx={{ ...skeletonBlockSx, borderRadius: "8px", flexShrink: 0 }}
      />
    </Box>
  );
}

function BookingsPageSkeleton() {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Skeleton variant="rectangular" width={220} height={28} sx={skeletonBlockSx} />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Skeleton variant="rectangular" width={110} height={36} sx={{ ...skeletonBlockSx, borderRadius: "10px" }} />
          <Skeleton variant="rectangular" width={110} height={36} sx={{ ...skeletonBlockSx, borderRadius: "10px" }} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          borderBottom: "1px solid #e2e8f0",
          mb: 3,
          pb: 1.25,
        }}
      >
        <Skeleton variant="rectangular" width={110} height={14} sx={skeletonBlockSx} />
        <Skeleton variant="rectangular" width={90} height={14} sx={skeletonBlockSx} />
      </Box>

      <Stack spacing={2}>
        {Array.from({ length: SKELETON_CARDS_COUNT }).map((_, index) => (
          <BookingCardSkeleton key={index} />
        ))}
      </Stack>
    </>
  );
}

const officeSelectSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    fontSize: "0.8125rem",
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

const tabButtonSx = (active: boolean) => ({
  p: 0,
  pb: 1.25,
  mb: "-1px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: active ? "#0d9488" : "#64748b",
  borderBottom: active ? "2px solid #0d9488" : "2px solid transparent",
  transition: "color 0.15s ease, border-color 0.15s ease",
  "&:hover": {
    color: active ? "#0d9488" : "#334155",
  },
});

export default function BookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const officeId = searchParams.get("officeId");
  const tabParam = searchParams.get("tab");
  const tab: BookingsTab = isBookingsTab(tabParam) ? tabParam : "upcoming";

  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [officesLoading, setOfficesLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [counts, setCounts] = useState<Partial<Record<BookingsTab, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    const savedOfficeId = sessionStorage.getItem(STORAGE_KEY_OFFICE);
    if (!officeId && savedOfficeId) {
      next.set("officeId", savedOfficeId);
      changed = true;
    }

    if (!isBookingsTab(next.get("tab"))) {
      next.set("tab", "upcoming");
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [officeId, searchParams, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadOffices = async () => {
      try {
        setOfficesLoading(true);
        const data = await getOffices();
        if (isMounted) {
          setOffices(data.items ?? []);
        }
      } catch (error) {
        console.error("Failed to load offices:", error);
        if (isMounted) {
          setOffices([]);
        }
      } finally {
        if (isMounted) {
          setOfficesLoading(false);
        }
      }
    };

    void loadOffices();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookings(tab, officeId ?? undefined);
      const items = data.items ?? [];
      setBookings(items);
      setCounts((prev) => ({ ...prev, [tab]: items.length }));
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [tab, officeId]);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getBookings(tab, officeId ?? undefined);
        if (isMounted) {
          const items = data.items ?? [];
          setBookings(items);
          setCounts((prev) => ({ ...prev, [tab]: items.length }));
        }
      } catch (error) {
        console.error("Failed to load bookings:", error);
        if (isMounted) {
          setBookings([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [tab, officeId]);

  useBookingRealtime((event) => {
    const shouldRefresh = [
      "data.reset",
      "booking.created",
      "booking.cancelled",
      "room.availability_changed",
    ].includes(event.type);

    if (shouldRefresh) {
      void loadData();
    }
  });

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });

    setSearchParams(next);
  };

  const changeTab = (newTab: BookingsTab) => {
    updateParams({ tab: newTab });
  };

  const updateOffice = (value: string) => {
    updateParams({ officeId: value || null });

    if (value) {
      sessionStorage.setItem(STORAGE_KEY_OFFICE, value);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_OFFICE);
    }
  };

  const handleCancelSuccess = (id: string) => {
    setBookings((prev) => prev.filter((item) => item.id !== id));
    setCounts((prev) => ({
      ...prev,
      [tab]: Math.max((prev[tab] ?? 1) - 1, 0),
    }));
  };

  const renderOfficesFilter = () => {
    if (officesLoading) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="rectangular" width={140} height={36} sx={{ ...skeletonBlockSx, borderRadius: "10px" }} />
        </Box>
      );
    }

    if (offices.length === 0) {
      return (
        <Typography sx={{ fontSize: "0.875rem", color: "#64748b", fontStyle: "italic" }}>
          Нет доступных офисов
        </Typography>
      );
    }

    return (
      <TextField
        select
        value={officeId ?? ""}
        onChange={(e) => updateOffice(e.target.value)}
        sx={{ ...officeSelectSx, minWidth: 160 }}
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
        <MenuItem value="">Все офисы</MenuItem>
        {offices.map((office) => (
          <MenuItem key={office.id} value={office.id}>
            {office.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <div className="BookingPage">
      <Header />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <BookingsPageSkeleton />
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.75rem",
                  color: "#0f172a",
                }}
              >
                Мои бронирования
              </Typography>

              {renderOfficesFilter()}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                borderBottom: "1px solid #e2e8f0",
                mb: 3,
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={() => changeTab("upcoming")}
                sx={tabButtonSx(tab === "upcoming")}
              >
                Предстоящие
                {counts.upcoming !== undefined ? ` (${counts.upcoming})` : ""}
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => changeTab("past")}
                sx={tabButtonSx(tab === "past")}
              >
                Прошедшие
                {counts.past !== undefined ? ` (${counts.past})` : ""}
              </Box>
            </Box>

            {bookings.length === 0 ? (
              <Typography sx={{ color: "#64748b", py: 4, fontSize: "1rem" }}>
                {tab === "upcoming"
                  ? "У вас пока нет активных бронирований"
                  : "Прошедших бронирований нет"}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {bookings.map((booking) => {
                  const start = fromUtcToMsk(booking.startsAt);
                  const end = fromUtcToMsk(booking.endsAt);

                  const month = start.format("MMMM").toUpperCase();
                  const day = start.format("D");
                  const timeRange = `${start.format("HH:mm")} - ${end.format("HH:mm")} MSK`;

                  const roomName = booking.room?.name ?? "";
                  const floor = booking.room?.floor ?? 1;

                  return (
                    <BookingCard
                      key={booking.id}
                      id={booking.id}
                      month={month}
                      day={day}
                      title={booking.title}
                      roomName={roomName}
                      floor={floor}
                      timeRange={timeRange}
                      onSuccess={() => handleCancelSuccess(booking.id)}
                    />
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Container>
    </div>
  );
}