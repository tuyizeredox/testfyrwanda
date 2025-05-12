import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';

const AuthFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Testify. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            {[
              { icon: <Facebook fontSize="small" />, label: 'Facebook', color: '#1877F2' },
              { icon: <Twitter fontSize="small" />, label: 'Twitter', color: '#1DA1F2' },
              { icon: <LinkedIn fontSize="small" />, label: 'LinkedIn', color: '#0A66C2' },
              { icon: <Instagram fontSize="small" />, label: 'Instagram', color: '#E4405F' }
            ].map((social, index) => (
              <Tooltip key={index} title={social.label}>
                <IconButton
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: social.color,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
          }}
        >
          {[
            { label: 'Privacy Policy', to: '#' },
            { label: 'Terms of Service', to: '#' },
            { label: 'Contact Us', to: '#' },
            { label: 'Help Center', to: '#' }
          ].map((link, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={link.to}
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{ '&:hover': { color: 'primary.main' } }}
            >
              {link.label}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default AuthFooter;
