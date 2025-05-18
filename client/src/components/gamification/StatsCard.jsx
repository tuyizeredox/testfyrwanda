import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

// Gamified stats card component
const StatsCard = ({
  title,
  value,
  icon,
  color,
  trend = null,
  trendLabel = '',
  tooltip = '',
  animation = true,
  titleFontSize,
  valueFontSize,
  iconSize,
  height,
  padding
}) => {
  const theme = useTheme();

  // Determine the color based on the prop or default to primary
  const cardColor = color || theme.palette.primary.main;

  // Determine the trend color
  const getTrendColor = () => {
    if (!trend) return 'inherit';
    return trend > 0
      ? theme.palette.success.main
      : trend < 0
        ? theme.palette.error.main
        : theme.palette.text.secondary;
  };

  // Determine the trend icon
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0
      ? '↑'
      : trend < 0
        ? '↓'
        : '→';
  };

  return (
    <Card
      sx={{
        height: height || '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 2, md: 3 },
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.03)} 0%, ${alpha(cardColor, 0.06)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 20px ${alpha(cardColor, 0.1)}`,
          '& .stats-icon': {
            transform: 'scale(1.1)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${cardColor}, ${alpha(cardColor, 0.4)})`,
        }
      }}
    >
      <CardContent sx={{ p: padding || { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="medium"
                sx={{
                  mr: 1,
                  fontSize: titleFontSize || { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                {title}
              </Typography>

              {tooltip && (
                <Tooltip title={tooltip} arrow>
                  <IconButton
                    size="small"
                    sx={{
                      p: 0.25,
                      color: alpha(theme.palette.text.secondary, 0.7),
                      '&:hover': {
                        color: cardColor,
                        bgcolor: alpha(cardColor, 0.1),
                      }
                    }}
                  >
                    <InfoIcon fontSize="small" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: theme.palette.text.primary,
                fontSize: valueFontSize || { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                animation: animation ? 'countUp 2s ease-out' : 'none',
                '@keyframes countUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {value}
            </Typography>

            {trend !== null && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                  color: getTrendColor(),
                  fontWeight: 'medium',
                  flexWrap: 'wrap',
                  gap: 0.5
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                  }}
                >
                  {getTrendIcon()} {Math.abs(trend)}%
                </Typography>

                {trendLabel && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: { xs: 0, sm: 0.5, md: 1 },
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                    }}
                  >
                    {trendLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Avatar
            className="stats-icon"
            sx={{
              width: iconSize?.width || iconSize || { xs: 40, sm: 44, md: 48 },
              height: iconSize?.height || iconSize || { xs: 40, sm: 44, md: 48 },
              bgcolor: alpha(cardColor, 0.1),
              color: cardColor,
              transition: 'transform 0.3s ease',
              boxShadow: `0 4px 12px ${alpha(cardColor, 0.2)}`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
