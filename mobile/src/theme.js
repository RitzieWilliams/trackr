import 'expo-sqlite/localStorage/install';
import { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

// Color tokens copied from the web app's styles.css (:root and [data-theme="light"])
const palettes = {
  dark: {
    bg: '#111111',
    surface: '#1a1a1a',
    surface2: '#242424',
    border: '#2e2e2e',
    text: '#ffffff',
    textMuted: '#757575',
    primary: '#ffffff',
    primaryText: '#111111',
    danger: '#ff3b30',
  },
  light: {
    bg: '#ffffff',
    surface: '#f5f5f5',
    surface2: '#e8e8e8',
    border: '#e5e5e5',
    text: '#111111',
    textMuted: '#757575',
    primary: '#111111',
    primaryText: '#ffffff',
    danger: '#ff3b30',
  },
};

const STORAGE_KEY = 'themePreference'; // 'system' | 'light' | 'dark'

const ThemeContext = createContext(null);

function readPreference() {
  try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch { return 'system'; }
}

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState(readPreference);

  const value = useMemo(() => {
    const scheme = preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
    return {
      scheme,
      colors: palettes[scheme],
      preference,
      setPreference(next) {
        setPreferenceState(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      },
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Shared type styles that mirror the web app's uppercase, tightly-tracked look
export const type = {
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6, textTransform: 'uppercase' },
  cardName: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
  body: { fontSize: 15 },
};
