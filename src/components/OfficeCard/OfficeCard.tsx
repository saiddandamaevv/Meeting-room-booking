import { useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import BookingsDialog from "../BookingDialog/BookingDialog";

interface OfficeCardProps {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  available: boolean;
  selectedDate?: string;
}

export default function OfficeCard({
  id,
  name,
  floor,
  capacity,
  available,
  selectedDate,
}: OfficeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          minWidth: 320,
          maxWidth: 440,
          borderRadius: 3.5,
          border: "1px solid #eef2f6",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardContent sx={{ p: 3, pb: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 700, fontSize: "1.35rem", color: "#0f172a" }}
          >
            {name}
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.95rem",
              mt: 0.5,
              mb: 2.5,
            }}
          >
            {floor} этаж
          </Typography>

          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              color: "#475569",
              fontSize: "0.95rem",
              mb: 1.5,
            }}
          >
            <PeopleIcon sx={{ fontSize: 22, color: "#64748b" }} />
            Вместимость до {capacity} человек
          </Typography>

          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              color: "#475569",
              fontSize: "0.95rem",
              mb: 3,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 22, color: "#64748b" }} />
            {available ? "Свободно" : "Занято"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              bgcolor: available ? "#d8f5ec" : "#f0f3f8",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: available ? "#0d9488" : "#94a3b8",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: available ? "#0f766e" : "#475569",
              }}
            >
              {available
                ? "Доступно на выбранное время"
                : "Недоступно на выбранное время"}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <Button
            variant="text"
            to={
              selectedDate
                ? { pathname: `/rooms/${id}`, search: `?date=${selectedDate}` }
                : `/rooms/${id}`
            }
            component={Link}
            sx={{
              flex: 1,
              py: 1.2,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2.5,
              color: "#0d9488",
              "&:hover": {
                backgroundColor: "rgba(13, 148, 136, 0.08)",
              },
            }}
          >
            подробнее
          </Button>
          <Button
            variant="contained"
            disabled={!available}
            onClick={() => setIsDialogOpen(true)}
            sx={{
              flex: 1,
              py: 1.2,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2.5,
              bgcolor: "#0d9488",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#0f766e",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: "#f1f5f9",
                color: "#94a3b8",
              },
            }}
          >
            Забронировать
          </Button>
        </CardActions>
      </Card>

      <BookingsDialog
        roomId={id}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialDate={selectedDate}
      />
    </>
  );
}