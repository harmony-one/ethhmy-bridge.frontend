import React, { useContext } from 'react';
import { Moon } from 'grommet-icons';
import { Button } from 'grommet/components/Button';
import { ThemeContext } from '../themes/ThemeContext';

interface Props {}

export const ThemeButton: React.FC<Props> = () => {
  const themeContext = useContext(ThemeContext);

  return (
    <Button
      onClick={themeContext.toggle}
      icon={
        <Moon color={themeContext.themeType === 'dark' ? 'white' : 'black'} />
      }
    />
  );
};

ThemeButton.displayName = 'ThemeButton';
