import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Color azul para elementos principales
    },
    secondary: {
      main: '#F3F4F6', // Color secundario, ajusta según sea necesario
    },
    background: {
      default: '#F9FAFB', // Color de fondo general
      paper: '#ffffff', // Color de fondo para tarjetas y elementos elevados
    },
    text: {
      primary: '#333333', // Color de texto principal
      secondary: '#666666', // Color de texto secundario
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    logo: {
      fontWeight: 700,
      fontSize: '1.5rem',
      fontFamily: '"Montserrat", sans-serif',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2196f3', // Color del header
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // Color de fondo del sidebar
          color: '#333333', // Color de texto del sidebar
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(33, 150, 243, 0.1)', // Color de fondo para el ítem seleccionado
            color: '#2196f3', // Color de texto para el ítem seleccionado
          },
        },
      },
    },
  },
});

export default theme;
