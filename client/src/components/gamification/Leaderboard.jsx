import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Chip,
  Button
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Gamified leaderboard component
const Leaderboard = ({
  title = 'Leaderboard',
  subtitle = '',
  data = [],
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  highlightCurrentUser = true,
  currentUserId = null,
  type = 'score', // 'score' or 'progress'
  emptyMessage = 'No data available'
}) => {
  const theme = useTheme();

  // Get medal color based on position
  const getMedalColor = (position) => {
    switch (position) {
      case 0: // 1st place
        return theme.palette.gamification.gold;
      case 1: // 2nd place
        return theme.palette.gamification.silver;
      case 2: // 3rd place
        return theme.palette.gamification.bronze;
      default:
        return theme.palette.text.disabled;
    }
  };

  // Get rank label
  const getRankLabel = (position) => {
    const rank = position + 1;
    switch (rank) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      default:
        return `${rank}th`;
    }
  };

  // Limit the number of items to display
  const displayData = data.slice(0, maxItems);

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 0, // Remove rounded corners
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrophyIcon
            sx={{
              color: theme.palette.gamification.gold,
              mr: 1,
              fontSize: 24
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {type === 'score' ? (
          <Chip
            label="Points"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              borderRadius: 0 // Remove rounded corners
            }}
          />
        ) : (
          <Chip
            label="Progress"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontWeight: 'medium',
              borderRadius: 0 // Remove rounded corners
            }}
          />
        )}
      </Box>

      <List sx={{ p: 0 }}>
        {displayData.length > 0 ? displayData.map((item, index) => {
          const isCurrentUser = highlightCurrentUser && item.id === currentUserId;
          const medalColor = getMedalColor(index);

          return (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  bgcolor: isCurrentUser ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  '&:hover': {
                    bgcolor: isCurrentUser
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.action.hover, 0.05),
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: alpha(medalColor, 0.1),
                    color: medalColor,
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    mr: 2,
                    border: index < 3 ? `2px solid ${medalColor}` : 'none',
                  }}
                >
                  {index < 3 ? (index + 1) : getRankLabel(index)}
                </Box>

                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar
                    src={item.avatar}
                    alt={item.name}
                    sx={{
                      width: 36,
                      height: 36,
                      border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : 'none',
                      boxShadow: isCurrentUser
                        ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                        : 'none',
                    }}
                  >
                    {item.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        fontWeight={isCurrentUser ? 'bold' : 'medium'}
                        color={isCurrentUser ? 'primary.main' : 'text.primary'}
                        sx={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name}
                      </Typography>

                      {isCurrentUser && (
                        <Chip
                          label="You"
                          size="small"
                          sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '0.625rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderRadius: 0 // Remove rounded corners
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.title || item.email}
                    </Typography>
                  }
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 50,
                    height: 28,
                    borderRadius: 0, // Remove rounded corners
                    bgcolor: alpha(theme.palette.primary.main, isCurrentUser ? 0.1 : 0.05),
                    color: isCurrentUser ? theme.palette.primary.main : theme.palette.text.primary,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  {type === 'score' ? item.score : `${item.progress}%`}
                </Box>
              </ListItem>

              {index < displayData.length - 1 && (
                <Divider
                  component="li"
                  sx={{
                    borderColor: alpha(theme.palette.divider, 0.08),
                    mx: 2
                  }}
                />
              )}
            </React.Fragment>
          );
        }) : (
          <ListItem sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg"
              alt="No data"
              sx={{
                width: '100%',
                maxWidth: 120,
                height: 'auto',
                mb: 2,
                opacity: 0.7
              }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {emptyMessage}
            </Typography>
          </ListItem>
        )}
      </List>

      {showViewAll && data.length > maxItems && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={onViewAll}
            sx={{
              borderRadius: 0, // Remove rounded corners
              textTransform: 'none',
              fontWeight: 'medium',
            }}
          >
            View All Rankings
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default Leaderboard;
