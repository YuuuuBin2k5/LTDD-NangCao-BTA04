/**
 * Theme Constants - Doraemon Inspired Design System
 * Color palette, typography, spacing, and effects for MAPIC
 */

// Doraemon Color Palette
export const colors = {
  // Primary Doraemon Theme Colors
  cream: '#FFF8E7',        // Đất (Land)
  matchaGreen: '#B8D4A8',  // Cây cối (Vegetation)
  babyBlue: '#A8D8EA',     // Nước (Water)
  lightLavender: '#E8D5F2', // UI elements
  
  // Doraemon Character Colors
  doraemonBlue: '#0095D9',
  doraemonRed: '#E60012',
  doraemonYellow: '#FFD700',
  doraemonWhite: '#FFFFFF',
  
  // Functional Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray Scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Opacity variants for glassmorphism
  opacity: {
    glass: 'rgba(255, 255, 255, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  }
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    bold: 'System-Bold',
    semibold: 'System-Semibold',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};

// Spacing Scale (based on 4px grid)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows (iOS and Android compatible)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Glassmorphism Effect
export const glassmorphism = {
  light: {
    backgroundColor: colors.opacity.glass,
    borderRadius: borderRadius['2xl'],
    ...shadows.md,
    // Note: backdropFilter not supported in React Native
    // Use BlurView component instead
  },
  
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
};

// Animation Durations (in milliseconds)
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Animation Easing
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

// Z-Index Layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Breakpoints (for responsive design)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Icon Sizes
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
};

// Avatar Sizes
export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

// Button Heights
export const buttonHeight = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

// Map Specific Constants
export const mapTheme = {
  defaultZoom: 15,
  minZoom: 3,
  maxZoom: 20,
  cameraTilt: 12, // degrees for 3D effect
  clusterThreshold: 10, // Start clustering when > 10 markers
};

// Export default theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glassmorphism,
  animation,
  easing,
  zIndex,
  breakpoints,
  iconSize,
  avatarSize,
  buttonHeight,
  mapTheme,
};

export default theme;
