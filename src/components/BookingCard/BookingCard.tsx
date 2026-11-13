import { useState } from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CancelBookingDialog from "../CancelBookingDialog/CancelBookingDialog";

interface BookingCardProps {
  id: string;
  month: string;
  day: string;
  title: string;
  roomName: string;
  floor: number;
  timeRange: string;
  onSuccess?: () => void;
}

export default function BookingCard({
  id,
  month,
  day,
  title,
  roomName,
  floor,
  timeRange,
  onSuccess,
}: BookingCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2.5,
        borderRadius: "16px",
        border: "1px solid #eef2f6",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "12px",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {month}
          </Typography>
          <Typography
            sx={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {day}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "#0f172a",
              mb: 0.7,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              fontSize: "0.875rem",
              color: "#64748b",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#0d9488",
                fontWeight: 600,
              }}
            >
              <MeetingRoomOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
                {roomName}
              </Typography>
            </Box>

            <Box component="span" sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}>
              •
            </Box>

            <Typography sx={{ fontSize: "inherit", color: "#64748b" }}>
              {floor} этаж
            </Typography>

            <Box component="span" sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}>
              •
            </Box>

            <Typography sx={{ fontSize: "inherit", color: "#64748b" }}>
              {timeRange}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        variant="outlined"
        onClick={() => setIsDialogOpen(true)}
        sx={{
          color: "#ef4444",
          borderColor: "#fca5a5",
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          px: 2.5,
          py: 0.8,
          "&:hover": {
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.04)",
          },
        }}
      >
        Отменить
      </Button>

      <CancelBookingDialog 
        id={id}
        title={title}
        roomName={roomName}
        floor={floor}
        dateTime={timeRange}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={onSuccess}
      />
    </Paper>
  );
}