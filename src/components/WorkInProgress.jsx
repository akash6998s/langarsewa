import React from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import Button from '@mui/material/Button';
import { theme } from '../theme';

const WorkInProgress = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: theme.colors.background,
      padding: '1rem',
    },
    card: {
      background: theme.colors.neutralLight,
      borderRadius: '1rem',
      padding: '3rem 2rem',
      maxWidth: '40rem',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
      },
      '@media (min-width: 600px)': {
        padding: '4rem 3rem',
      },
    },
    icon: {
      fontSize: '4rem',
      color: theme.colors.primary,
      marginBottom: '1rem',
    },
    heading: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: theme.colors.neutralDark,
      fontFamily: theme.fonts.heading,
      marginBottom: '1.5rem',
      lineHeight: 1.2,
      '@media (min-width: 600px)': {
        fontSize: '3.5rem',
      },
    },
    text: {
      fontSize: '1.25rem',
      color: theme.colors.secondary,
      fontFamily: theme.fonts.body,
      marginBottom: '2.5rem',
      lineHeight: 1.6,
      maxWidth: '35rem',
      margin: '0 auto 2.5rem',
    },
    button: {
      fontFamily: theme.fonts.body,
      backgroundColor: theme.colors.primary,
      color: theme.colors.neutralLight,
      '&:hover': {
        backgroundColor: theme.colors.primaryLight,
      },
    },
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <ConstructionIcon style={styles.icon} />
        <h1 style={styles.heading}>
          Currently Under Construction
        </h1>
        <p style={styles.text}>
          We are hard at work to bring you a beautiful new website. Please check back
          soon to see the finished result!
        </p>
        <Button
          variant="contained"
          style={styles.button}
          onClick={() => (window.location.href = '/')}
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default WorkInProgress;