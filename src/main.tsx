import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ru';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Moscow');
dayjs.locale('ru');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);