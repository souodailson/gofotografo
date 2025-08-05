import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const AuthLayout = ({ children, title, description }) => {
  const { theme, toggleTheme } = useTheme();
  
  const logoUrlLightTheme = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20gofotografo%20claro.png"; 
  const logoUrlDarkTheme = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20fundo%20claro%20go.fotografo%20cor%20.png";
  const displayLogo = theme === 'dark' ? logoUrlDarkTheme : logoUrlLightTheme;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-sky-100 dark:bg-[#161616] p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 backdrop-blur-sm"
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md bg-card/80 dark:bg-card/70 backdrop-blur-lg shadow-2xl rounded-xl p-6 sm:p-8 border border-border/50"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 20 }}
            className="inline-block mb-4"
          >
            <img src={displayLogo} alt="GO.FOTÓGRAFO Logo" className="h-10 sm:h-12 w-auto" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>}
        </div>
        {children}
      </motion.div>

      <motion.div 
        className="fixed -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-60 h-60 sm:w-72 sm:h-72 bg-customPurple/20 dark:bg-customPurple/15 rounded-full opacity-50 dark:opacity-40 filter blur-3xl animate-pulse"
        style={{ animationDuration: '6s' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, delay: 0.3, type: "spring" }}
      />
      <motion.div 
        className="fixed -top-10 -right-10 sm:-top-20 sm:-right-20 w-60 h-60 sm:w-72 sm:h-72 bg-customGreen/20 dark:bg-customGreen/15 rounded-full opacity-50 dark:opacity-40 filter blur-3xl animate-pulse"
        style={{ animationDuration: '7s', animationDelay: '1s' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, delay: 0.5, type: "spring" }}
      />
       <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground/80">
        © {new Date().getFullYear()} GO.FOTÓGRAFO. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default AuthLayout;