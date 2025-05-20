// src/components/Footer.js
import React from 'react';
import { 
  Box, 
  Container, 
  Typography,
  Divider, 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GamesIcon from '@mui/icons-material/SportsEsports';

function Footer() {
  const theme = useTheme();
  const year = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        py: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1
        }}>
          <GamesIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold' }}>
            GameService
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ 
            mt: 1,
            fontSize: '0.75rem'
          }}
        >
          © {year} VideoGame Distribution Service. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;