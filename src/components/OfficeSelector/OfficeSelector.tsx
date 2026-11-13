import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getOffices } from "../../api/offices";

interface Office {
  id: string;
  name: string;
  address: string;
  timezone: string;
}

interface OfficeSelectorProps {
  onChange: (officeId: string) => void | Promise<void>;
  value?: string;
}

export default function OfficeSelector({ onChange, value = "" }: OfficeSelectorProps) {
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchOffices = async () => {
      try {
        const officesData = await getOffices();
        if (isMounted) {
          setOffices(officesData?.items ?? []);
        }
      } catch (error) {
        console.error("Failed to load offices:", error);
      }
    };
    fetchOffices();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentOffice = offices.find((o) => o.id === value);

  const handleChange = (event: SelectChangeEvent) => {
    const nextValue = typeof event.target.value === 'string' ? event.target.value : '';
    onChange(nextValue);
  };

  const selectValue = offices.some((o) => o.id === value) ? value : "";

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      <Box sx={{ width: 280 }}>
        <FormControl fullWidth size="small" variant="standard">
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Select
              disableUnderline
              displayEmpty
              id="office-select"
              value={selectValue}
              onChange={handleChange}
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
              renderValue={(selected) => {
                if (!selected || !currentOffice) {
                  return (
                    <Box
                      component="span"
                      sx={{ color: "text.secondary", fontWeight: 500 }}
                    >
                      Выберите офис
                    </Box>
                  );
                }
                return currentOffice.name;
              }}
            >
              <MenuItem value="">Выберите офис</MenuItem>
              {offices.map((item: Office) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>

            <Typography
              sx={{ color: "text.secondary", fontSize: "0.85rem", mt: 0.5 }}
            >
              {currentOffice
                ? `${currentOffice.address} • Часовой пояс: ${currentOffice.timezone || "MSK"}`
                : "Локация не выбрана"}
            </Typography>
          </Box>
        </FormControl>
      </Box>
    </Container>
  );
}