import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { pixelThemes, type PixelTheme, type PixelThemeName } from '@/constants/theme';

const STORAGE_KEY = 'pixelday.theme.v2';

type PixelThemeContextValue = {
  theme: PixelTheme;
  themeName: PixelThemeName;
  setThemeName: (themeName: PixelThemeName) => void;
};

const PixelThemeContext = createContext<PixelThemeContextValue | null>(null);

export function PixelThemeProvider({ children }: PropsWithChildren) {
  const [themeName, setThemeNameState] = useState<PixelThemeName>('nord');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((savedThemeName) => {
        if (savedThemeName === 'light' || savedThemeName === 'dark' || savedThemeName === 'nord') {
          setThemeNameState(savedThemeName);
        } else {
          setThemeNameState('nord');
        }
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({
      theme: pixelThemes[themeName],
      themeName,
      setThemeName: (nextThemeName: PixelThemeName) => {
        setThemeNameState(nextThemeName);
        AsyncStorage.setItem(STORAGE_KEY, nextThemeName).catch(() => undefined);
      },
    }),
    [themeName]
  );

  return <PixelThemeContext.Provider value={value}>{children}</PixelThemeContext.Provider>;
}

export function usePixelTheme() {
  const value = useContext(PixelThemeContext);

  if (!value) {
    throw new Error('usePixelTheme must be used inside PixelThemeProvider');
  }

  return value;
}
