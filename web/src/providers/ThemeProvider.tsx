import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export type Theme = 'light' | 'dark' | 'aurora' | 'oceanic' | 'forest' | 'sunset';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'aurora', 'oceanic', 'forest', 'sunset']}
    >
      {children}
    </NextThemesProvider>
  );
}; 