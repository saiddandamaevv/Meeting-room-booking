import * as React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

interface TimeInputFieldProps {
  value: string;
  onChange: (val: string) => void;
  onBlur?: (val: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
}

const MIN_HOUR = 9;
const MAX_HOUR = 20;

export default function TimeInputField({
  value,
  onChange,
  onBlur,
  name = "time",
  id = "time",
  required = true,
}: TimeInputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    if (raw.length > 4) {
      raw = raw.slice(0, 4);
    }

    let hours = raw.slice(0, 2);
    let minutes = raw.slice(2, 4);

    if (hours.length === 2 && Number(hours) > 23) {
      hours = "23";
    }

    if (minutes.length === 2 && Number(minutes) > 59) {
      minutes = "59";
    }

    let formatted = hours;
    if (raw.length > 2 || (raw.length === 2 && e.target.value.includes(":"))) {
      formatted = `${hours}:${minutes}`;
    }

    onChange(formatted);
  };

  const handleBlur = () => {
    if (!value) {
      if (onBlur) onBlur("");
      return;
    }

    const parts = value.split(":");
    let hours = Number(parts[0]);
    let rawMinutes = parts[1] || "00";

    if (rawMinutes.length === 1) {
      rawMinutes = `${rawMinutes}0`;
    }

    let minutes = Math.round(Number(rawMinutes) / 15) * 15;

    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }

    if (hours < MIN_HOUR) {
      hours = MIN_HOUR;
      minutes = 0;
    } else if (hours > MAX_HOUR) {
      hours = MAX_HOUR;
      minutes = 0;
    }

    if (hours === MAX_HOUR) {
      minutes = 0;
    }

    const paddedHours = String(hours).padStart(2, "0");
    const paddedMinutes = String(minutes).padStart(2, "0");
    const finalTime = `${paddedHours}:${paddedMinutes}`;

    onChange(finalTime);
    if (onBlur) {
      onBlur(finalTime);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value.endsWith(":")) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  return (
    <TextField
      required={required}
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="--:--"
      fullWidth
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0.8 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#475569" }} />
            </InputAdornment>
          ),
        },
        htmlInput: {
          maxLength: 5,
          inputMode: "numeric",
        },
      }}
      sx={{
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
          letterSpacing: "0.05em",
          "&::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        },
      }}
    />
  );
}