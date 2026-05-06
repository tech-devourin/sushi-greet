import React, { createContext, useContext, useMemo } from 'react';
import { GlobalColors, FontSize } from '../styles/GlobalStyleConfigs';
import { FONTS } from '../styles/Fonts';
import { Colors } from '../styles/Colors';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const themeData = {
  colors: {
    ...GlobalColors,
    ...Colors,
    tableStatus: {
      bp: '#F9F7A9',
      f: '#fff',
      ot: GlobalColors.defaultLight,
    },
    tableBorder: {
      bp: '#c4c165',
      f: 'lightgray',
      ot: GlobalColors.default,
    },
    feedback: {
      'Excellent': GlobalColors.success,
      'Good': GlobalColors.default,
      'Average': GlobalColors.error,
    }
  },
  fontSize: FontSize,
  fonts: FONTS,
  device: {
    width,
    height,
  }
};

type ThemeType = typeof themeData;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeValue = useMemo(() => ({
    theme: themeData,
    isDark: false,
  }), []);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
