import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './themes/theme.css';
import { AppThemeProvider } from './themes/ThemeProvider';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <Notifications position="bottom-right" />
      <HashRouter>
        <App />
      </HashRouter>
    </AppThemeProvider>
  </StrictMode>,
);
