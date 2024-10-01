import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import IconButton from '@mui/material/IconButton';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';

const drawerWidth = 240;

const Root = styled('div')({
  display: 'flex',
  minHeight: '100vh',
});

const Header = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
}));

const NavBar = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: theme.palette.background.default,
  },
}));

const Content = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingBottom: 64, // height of footer
  marginTop: 64, // height of AppBar
  backgroundColor: theme.palette.secondary.main,
}));

const Footer = styled('footer')(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  textAlign: 'center',
  zIndex: theme.zIndex.drawer + 2,
}));

const Layout = ({ children }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Projects', icon: <AssignmentIcon />, path: '/projects' },
    { text: 'Tasks', icon: <FormatListBulletedIcon />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarTodayIcon />, path: '/calendar' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Integrations', icon: <IntegrationInstructionsIcon />, path: '/integrations' },
  ];

  return (
    <Root>
      <Header position="fixed">
        <Toolbar>
          <img src={logo} alt="Logo" />
          <Typography variant="logo" noWrap component="div" paddingLeft="10px">
            ProTrack
          </Typography>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '10px' }} >
            <Button variant="contained" startIcon={<NotificationsIcon />} 
            size='small' color='primary'>Notifications</Button>
            <Button variant="contained" startIcon={<SettingsIcon />} 
            size='small' component={Link} to={'/settings'} sx={{ background: '#22C55E' }}>Settings</Button>
          </Box>
        </Toolbar>
      </Header>
      <NavBar variant="permanent">
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </NavBar>
      <Box component="div" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Content>
          {children}
        </Content>
      </Box>
      <Footer>
        <ButtonGroup variant="body2">
          <Button sx={{ textTransform: 'capitalize' }}>About Us</Button>
          <Button sx={{ textTransform: 'capitalize' }}>Contact</Button>
        </ButtonGroup>
        <IconButton aria-label="instagram contact">
          <InstagramIcon />
        </IconButton>
        <IconButton aria-label="twitter contact">
          <TwitterIcon />
        </IconButton>
        <IconButton aria-label="facebook contact">
          <FacebookOutlinedIcon />
        </IconButton>
      </Footer>
    </Root>
  );
};

export default Layout;
