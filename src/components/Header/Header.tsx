import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { Link, useLocation } from "react-router-dom";

const STORAGE_KEY = "selected_office_id";

export default function Header() {
  const location = useLocation();

  const savedOfficeId = sessionStorage.getItem(STORAGE_KEY);
  const roomsLink = savedOfficeId ? `/rooms?officeId=${savedOfficeId}` : "/rooms";

  const currentTab = location.pathname.startsWith("/bookings")
    ? "/bookings"
    : "/rooms";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0f2f5",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            height: 64,
            minHeight: "64px !important",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            component={Link}
            to={roomsLink}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none" }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              <EventAvailableIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "1.1rem",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              BookRoom
            </Typography>
          </Box>

          <Tabs
            value={currentTab}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              height: 64,
              minHeight: 64,
              "& .MuiTabs-indicator": {
                height: 2.5,
              },
            }}
          >
            <Tab
              component={Link}
              to={roomsLink}
              value="/rooms"
              disableRipple
              label="Переговорные"
              sx={{
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#64748b",
                px: 2,
                height: 64,
                minHeight: 64,
                "&.Mui-selected": {
                  fontWeight: 600,
                },
              }}
            />
            <Tab
              component={Link}
              to="/bookings"
              value="/bookings"
              disableRipple
              label="Мои бронирования"
              sx={{
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#64748b",
                px: 2,
                height: 64,
                minHeight: 64,
                "&.Mui-selected": {
                  fontWeight: 600,
                },
              }}
            />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                fontSize: "0.9rem",
                lineHeight: 1,
              }}
            >
              Константин К.
            </Typography>
            <Avatar
              sx={{
                bgcolor: "#4f75e2",
                color: "#ffffff",
                width: 38,
                height: 38,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              KK
            </Avatar>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}