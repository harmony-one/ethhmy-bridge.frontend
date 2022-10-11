import React, { useCallback, useEffect, useState } from 'react';
import { baseTheme } from './baseTheme';
import { lightTheme } from './lightTheme';
import { Grommet } from 'grommet';
import Cookie from 'js-cookie';
import { ThemeContext, ThemeType } from './ThemeContext';

const COOKIE_NAME = 'hmr-themeType';

let defaultThemeType: ThemeType = 'dark';
const cookieThemeType = Cookie.get(COOKIE_NAME);

if (cookieThemeType === 'dark' || cookieThemeType === 'light') {
  defaultThemeType = cookieThemeType;
}

export const ThemeProvider: React.FC = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>(defaultThemeType);

  useEffect(() => {
    const cookieThemeType = Cookie.get(COOKIE_NAME);

    if (
      cookieThemeType &&
      (cookieThemeType === 'dark' || cookieThemeType === 'light')
    ) {
      setThemeType(cookieThemeType);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add(`theme-${themeType}`);

    return () => {
      document.body.classList.remove(`theme-${themeType}`);
    };
  }, [themeType]);

  const toggleTheme = useCallback(() => {
    const newThemeType = themeType === 'dark' ? 'light' : 'dark';
    setThemeType(themeType === 'dark' ? 'light' : 'dark');
    Cookie.set(COOKIE_NAME, newThemeType);
  }, [setThemeType, themeType]);

  const theme = themeType === 'dark' ? baseTheme : lightTheme;
  const isDark = () => themeType === 'dark';
  return (
    <ThemeContext.Provider
      value={{
        themeType: themeType,
        theme: theme,
        toggle: toggleTheme,
        isDark,
      }}
    >
      <Grommet theme={theme} plain={true} full="min" id="grommetRoot">
        {children}
      </Grommet>
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';
