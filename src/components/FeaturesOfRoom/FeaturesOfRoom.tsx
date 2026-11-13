import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TvOutlinedIcon from "@mui/icons-material/TvOutlined";
import GestureOutlinedIcon from "@mui/icons-material/GestureOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";

export interface RoomFeature {
  code: string;
  name: string;
}

export interface FeaturesOfRoomProps {
  name: string;
  officeName?: string;
  address?: string;
  capacity: number;
  features?: RoomFeature[];
}

export default function FeaturesOfRoom({
  name,
  officeName,
  address,
  capacity,
  features = [],
}: FeaturesOfRoomProps) {
  const getFeatureIcon = (code: string, text: string) => {
    const checkTarget = `${code} ${text}`.toLowerCase();
    if (
      checkTarget.includes("tv") ||
      checkTarget.includes("projector") ||
      checkTarget.includes("тв") ||
      checkTarget.includes("проектор") ||
      checkTarget.includes("экран")
    ) {
      return <TvOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />;
    }
    if (
      checkTarget.includes("board") ||
      checkTarget.includes("доска") ||
      checkTarget.includes("маркер")
    ) {
      return <GestureOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />;
    }
    if (
      checkTarget.includes("video") ||
      checkTarget.includes("conf") ||
      checkTarget.includes("видео") ||
      checkTarget.includes("конференц") ||
      checkTarget.includes("камера")
    ) {
      return <VideocamOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />;
    }
    return <TvOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />;
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 380,
        borderRadius: "20px",
        border: "1.5px solid #f1f5f9",
        backgroundColor: "#ffffff",
        p: 1,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            fontSize: "1.45rem",
            color: "#0f172a",
            letterSpacing: "-0.02em",
            mb: 0.6,
          }}
        >
          {name}
        </Typography>

        {(officeName || address) && (
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#64748b",
              fontWeight: 400,
            }}
          >
            {[officeName, address].filter(Boolean).join(" · ")}
          </Typography>
        )}

        <Divider sx={{ my: 2.2, borderColor: "#f1f5f9" }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 20, color: "#0d9488" }} />
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#1e293b",
                fontWeight: 400,
              }}
            >
              Вместимость: до {capacity} человек
            </Typography>
          </Box>

          {features.map((feature) => (
            <Box
              key={feature.code}
              sx={{ display: "flex", alignItems: "center", gap: 1.6 }}
            >
              {getFeatureIcon(feature.code, feature.name)}
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#1e293b",
                  fontWeight: 400,
                }}
              >
                {feature.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}