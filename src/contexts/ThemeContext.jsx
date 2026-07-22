import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import borrowTheme from '../theme/borrowTheme';

export const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={borrowTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
