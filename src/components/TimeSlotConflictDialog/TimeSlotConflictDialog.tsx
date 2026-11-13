import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

interface TimeSlotConflictDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TimeSlotConflictDialog({
  open,
  onClose,
}: TimeSlotConflictDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            border: "3px solid #f59e0b",
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            px: 4,
            pt: 4,
            pb: 3.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 28, color: "#dc2626" }} />
          </Box>

          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#0f172a",
              mb: 1.5,
            }}
          >
            Время уже занято
          </Typography>

          <Typography
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.5,
              color: "#64748b",
              mb: 3,
              maxWidth: 320,
            }}
          >
            Выбранный интервал был занят.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={onClose}
            sx={{
              backgroundColor: "#0d9488",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              py: 1.25,
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#0f766e",
                boxShadow: "none",
              },
            }}
          >
            Выбрать другое время
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}