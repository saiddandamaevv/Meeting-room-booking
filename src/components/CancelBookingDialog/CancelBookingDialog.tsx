import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { cancelBooking } from "../../api/bookings";

interface CancelBookingDialogProps {
  id: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  roomName: string;
  floor: number | string;
  dateTime: string;
}

export default function CancelBookingDialog({
  id,
  open,
  onClose,
  onSuccess,
  title,
  roomName,
  floor,
  dateTime,
}: CancelBookingDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      await cancelBooking(id);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
    } finally {
      setLoading(false);
    }
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
            borderRadius: "20px",
            p: 1.5,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#0f172a",
          pb: 1,
          pt: 1.5,
        }}
      >
        Отменить бронирование?
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.875rem",
            lineHeight: 1.45,
            mb: 2.5,
          }}
        >
          Это действие нельзя будет отменить. Освободившееся время станет
          доступно другим сотрудникам.
        </Typography>

        <Box
          sx={{
            backgroundColor: "#f8fafc",
            borderRadius: "14px",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0f172a",
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              color: "#64748b",
              fontSize: "0.85rem",
            }}
          >
            <MeetingRoomOutlinedIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <Typography sx={{ fontSize: "inherit", color: "inherit" }}>
              Комната ‘{roomName}’, {floor} этаж
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              color: "#64748b",
              fontSize: "0.85rem",
            }}
          >
            <CalendarTodayOutlinedIcon
              sx={{ fontSize: 17, color: "#64748b" }}
            />
            <Typography sx={{ fontSize: "inherit", color: "inherit" }}>
              {dateTime}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
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
          Нет, оставить
        </Button>

        <Button
          onClick={handleCancelBooking}
          disabled={loading}
          variant="contained"
          fullWidth
          disableElevation
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            py: 1.1,
            borderRadius: "10px",
            backgroundColor: "#ef4444",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#dc2626",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              backgroundColor: "#fca5a5",
              color: "#ffffff",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Да, отменить"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}