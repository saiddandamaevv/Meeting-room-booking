import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Header from "../../components/Header/Header";
import FeaturesOfRoom from "../../components/FeaturesOfRoom/FeaturesOfRoom";
import RoomDailySchedule from "../../components/RoomDailySchedule/RoomDailySchedule";
import BookingDialog from "../../components/BookingDialog/BookingDialog";
import type { BookingItem } from "../../components/RoomDailySchedule/RoomDailySchedule";
import { getRoomBookings, getRoomById } from "../../api/rooms";
import { useBookingRealtime } from "../../hooks/useBookingRealtime";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Office {
  id: string;
  name: string;
  address: string;
  timezone: string;
}

interface Feature {
  code: string;
  name: string;
}

interface RoomDetails {
  id: string;
  officeId: string;
  name: string;
  floor: number;
  capacity: number;
  features: Feature[];
  office: Office;
  available: boolean;
}

const skeletonBlockSx = {
  borderRadius: 1,
  bgcolor: "#e2e8f0",
};

const SCHEDULE_HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

function BreadcrumbsSkeleton() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
      <Skeleton
        variant="rectangular"
        width={70}
        height={10}
        sx={skeletonBlockSx}
      />
      <NavigateNextIcon sx={{ fontSize: 14, color: "#cbd5e1" }} />
      <Skeleton
        variant="rectangular"
        width={50}
        height={10}
        sx={skeletonBlockSx}
      />
      <NavigateNextIcon sx={{ fontSize: 14, color: "#cbd5e1" }} />
      <Skeleton
        variant="rectangular"
        width={70}
        height={10}
        sx={skeletonBlockSx}
      />
    </Box>
  );
}

function FeaturesOfRoomSkeleton() {
  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        p: 2.5,
      }}
    >
      <Skeleton
        variant="rectangular"
        width="55%"
        height={16}
        sx={{ ...skeletonBlockSx, mb: 1 }}
      />
      <Skeleton
        variant="rectangular"
        width="75%"
        height={10}
        sx={{ ...skeletonBlockSx, mb: 2.5 }}
      />

      <Box sx={{ borderTop: "1px solid #f1f5f9", mb: 2 }} />

      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}
        >
          <Skeleton
            variant="rectangular"
            width={14}
            height={14}
            sx={{ ...skeletonBlockSx, borderRadius: "4px", flexShrink: 0 }}
          />
          <Skeleton
            variant="rectangular"
            width="85%"
            height={10}
            sx={skeletonBlockSx}
          />
        </Box>
      ))}
    </Box>
  );
}

function RoomDailyScheduleSkeleton() {
  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        p: 2.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Skeleton
            variant="rectangular"
            width={150}
            height={14}
            sx={{ ...skeletonBlockSx, mb: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={90}
            height={10}
            sx={skeletonBlockSx}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          width={85}
          height={30}
          sx={{ ...skeletonBlockSx, borderRadius: "8px" }}
        />
      </Box>

      {SCHEDULE_HOURS.map((hour) => (
        <Box key={hour} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            sx={{
              width: 40,
              fontSize: "0.65rem",
              color: "#94a3b8",
              flexShrink: 0,
            }}
          >
            {String(hour).padStart(2, "0")}:00
          </Typography>
          <Box
            sx={{ flex: 1, borderBottom: "1px solid #f1f5f9", height: 28 }}
          />
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Skeleton
          variant="rectangular"
          width={110}
          height={24}
          sx={{ ...skeletonBlockSx, borderRadius: "8px" }}
        />
      </Box>
    </Box>
  );
}

function RoomPageSkeleton() {
  return (
    <>
      <BreadcrumbsSkeleton />
      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeaturesOfRoomSkeleton />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <RoomDailyScheduleSkeleton />
        </Grid>
      </Grid>
    </>
  );
}

export default function SelectedRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedDate: Dayjs = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (
      dateParam &&
      dayjs.tz(dateParam, "YYYY-MM-DD", "Europe/Moscow").isValid()
    ) {
      return dayjs.tz(dateParam, "Europe/Moscow");
    }
    return dayjs().tz("Europe/Moscow");
  }, [searchParams]);

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(true);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const pageLoading = roomLoading || loading;

  const refetchBookings = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const data = await getRoomBookings(roomId, formattedDate);
      const items = Array.isArray(data) ? data : (data.items ?? []);
      setBookings(items);
    } catch (error) {
      console.error("Ошибка при загрузке расписания комнаты:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId, selectedDate]);

  useBookingRealtime((event) => {
    const shouldRefresh = [
      "data.reset",
      "booking.created",
      "booking.cancelled",
      "room.availability_changed",
    ].includes(event.type);

    if (shouldRefresh) {
      void refetchBookings();
    }
  });

  useEffect(() => {
    let isMounted = true;

    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        setRoomLoading(true);
        const data = await getRoomById(roomId);
        if (isMounted) {
          setRoom(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке информации о переговорной:", error);
      } finally {
        if (isMounted) {
          setRoomLoading(false);
        }
      }
    };

    void fetchRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const data = await getRoomBookings(roomId, formattedDate);
        const items = Array.isArray(data) ? data : (data.items ?? []);
        if (isMounted) {
          setBookings(items);
        }
      } catch (error) {
        console.error("Ошибка при загрузке расписания комнаты:", error);
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
  }, [roomId, selectedDate]);

  const handleOpenBookingDialog = () => {
    setIsBookingDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setIsBookingDialogOpen(false);
  };

  const handleBookingSuccess = async () => {
    await refetchBookings();
  };

  const breadcrumbs = room
    ? [
        { label: "Главная", to: "/" },
        { label: "Офисы", to: "/" },
        { label: room.name, to: "" },
      ]
    : [];

  if (pageLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <RoomPageSkeleton />
        </Container>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Комната не найдена.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                to={item.to}
                style={{ color: "#475569", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>

        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeaturesOfRoom
              name={room.name}
              officeName={room.office.name}
              address={room.office.address}
              capacity={room.capacity}
              features={room.features}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <RoomDailySchedule
              selectedDate={selectedDate}
              bookings={bookings}
              onCreateBooking={handleOpenBookingDialog}
              onDateChange={(nextDate) => {
                const next = new URLSearchParams(searchParams);
                next.set("date", nextDate.format("YYYY-MM-DD"));
                setSearchParams(next, { replace: true });
              }}
            />
          </Grid>
        </Grid>
      </Container>

      <BookingDialog
        open={isBookingDialogOpen}
        roomId={room.id}
        roomName={room.name}
        officeName={room.office.name}
        floor={room.floor}
        onClose={handleCloseBookingDialog}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}
