import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RoomsPage from "./pages/RoomsPage/RoomsPage";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import SelectedRoomPage from './pages/SelecetedRoomPage/SelectedRoomPage';
import BookingPage from './pages/BookingPage/BookingPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',
      dark: '#0a8f82',
      light: '#2dd4bf',
      contrastText: '#ffffff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <>
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<SelectedRoomPage />} />
          <Route path="/bookings" element={<BookingPage />} />
        </Routes>
        </>
      </BrowserRouter>
    </ThemeProvider>
  );  
}

export default App;