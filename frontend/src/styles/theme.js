const colors = {
    light: {
      primary: {
        main: '#1e88e5',       // Primary blue
        dark: '#0d47a1',       // Dark blue for hover states
        light: '#bbdefb',      // Light blue for backgrounds
        contrastText: '#fff'   // White text on primary
      },
      secondary: {
        main: '#26a69a',       // Teal for accent elements
        dark: '#00796b',       // Dark teal for hover states
        light: '#b2dfdb',      // Light teal for backgrounds
        contrastText: '#fff'   // White text on secondary
      },
      success: {
        main: '#66bb6a',       // Green for positive indicators
        light: '#c8e6c9'       // Light green background
      },
      warning: {
        main: '#ffa726',       // Orange for warnings
        light: '#ffe0b2'       // Light orange background
      },
      error: {
        main: '#ef5350',       // Red for errors/negative sentiment
        light: '#ffcdd2'       // Light red background
      },
      info: {
        main: '#29b6f6',       // Light blue for info
        light: '#b3e5fc'       // Very light blue background
      },
      neutral: {
        main: '#9e9e9e',       // Grey for neutral sentiment
        light: '#f5f5f5',      // Light grey background 
        dark: '#616161'        // Dark grey
      },
      background: {
        default: '#fafafa',    // Off-white background
        paper: '#ffffff',      // White for cards/components
        alternate: '#f5f7fa'   // Slight blue-ish white for alternating sections
      },
      text: {
        primary: '#212121',    // Almost black for primary text
        secondary: '#757575',  // Dark grey for secondary text
        disabled: '#bdbdbd'    // Light grey for disabled text
      },
      divider: '#e0e0e0'       // Light grey for dividers
    },
    dark: {
      primary: {
        main: '#1e88e5',       // Keep primary blue consistent
        dark: '#0d47a1',
        light: '#1a237e',      // Darker blue for dark theme backgrounds
        contrastText: '#fff'
      },
      secondary: {
        main: '#26a69a',       // Keep teal accent 
        dark: '#00796b',
        light: '#004d40',      // Darker teal for dark theme
        contrastText: '#fff'
      },
      success: {
        main: '#66bb6a',
        light: '#1b5e20'       // Dark green background
      },
      warning: {
        main: '#ffa726',
        light: '#e65100'       // Dark orange background
      },
      error: {
        main: '#ef5350',
        light: '#b71c1c'       // Dark red background
      },
      info: {
        main: '#29b6f6',
        light: '#01579b'       // Dark blue background
      },
      neutral: {
        main: '#9e9e9e',
        light: '#424242',      // Dark grey in dark mode
        dark: '#757575'
      },
      background: {
        default: '#121212',    // Very dark grey base
        paper: '#1e1e1e',      // Dark grey for cards
        alternate: '#252525'   // Lighter dark grey for alternating sections
      },
      text: {
        primary: '#ffffff',    // White for primary text
        secondary: '#b0bec5',  // Light blue-grey for secondary text
        disabled: '#757575'    // Grey for disabled
      },
      divider: '#424242'       // Grey divider for dark theme
    }
  };
  
  // Typography
  const typography = {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.00735em'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.0075em'
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00714em'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01071em'
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em'
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase'
    }
  };

  const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const darkShadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
  };

  const borderRadius = {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  };

  const spacing = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem'
  };

  const transitions = {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  };

  const zIndex = {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  };
  
  const theme = {
    colors,
    typography,
    shadows,
    darkShadows,
    borderRadius,
    spacing,
    transitions,
    zIndex
  };
  
  export default theme;