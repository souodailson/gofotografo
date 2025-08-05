import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const GlobalLoadingIndicator = () => {
  const { theme } = useTheme();
  const logoUrlDarkTheme = "https://i.imgur.com/NUAO4d4.png";
  const logoUrlLightTheme = "https://i.imgur.com/dykyBO9.png";
  
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center">
        <img src={theme === 'dark' ? logoUrlDarkTheme : logoUrlLightTheme} alt="GO.FOTÓGRAFO Logo" className="h-12 mb-6 animate-pulse" />
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Carregando sua experiência...</p>
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator;