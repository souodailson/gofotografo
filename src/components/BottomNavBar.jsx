import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, Users, Wallet, Calendar, Settings2, LogOut, Trello, DollarSign, PiggyBank, HardDrive, BarChart2, Download, Gift } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/components/ui/use-toast";

const BottomNavBarItem = ({ icon: Icon, active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out w-16 h-16
      ${active ? 'text-primary-foreground scale-110' : 'text-muted-foreground hover:text-foreground hover:scale-105'}`}
    style={active ? { color: 'hsl(var(--primary-foreground))' } : {}}
    aria-label={label}
  >
    <div className={`relative w-6 h-6 mb-0.5 flex items-center justify-center`}>
      <Icon className={`w-6 h-6 transition-all duration-200 ${active ? 'drop-shadow-md' : ''}`} />
    </div>
    <span className={`text-[10px] font-medium transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-100'}`}>{label}</span>
  </button>
);

const BottomNavBar = forwardRef(({ activeTab, setActiveTab }, ref) => {
  const { user, logout, settings, isFeatureEnabled } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro no Logout:', error.message);
    }
  };

  const handleInstallApp = () => {
    if (window.handlePWAInstall) {
      window.handlePWAInstall();
    } else {
      toast({
        title: "Instalação não disponível",
        description: "A funcionalidade de instalação não está pronta. Tente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const userProfilePhoto = settings?.profile_photo || user?.user_metadata?.avatar_url;
  const userDisplayName = settings?.user_name || user?.user_metadata?.full_name || 'Usuário';
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'workflow', icon: Briefcase, label: 'Trabalhos' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'financial', icon: Wallet, label: 'Caixa' },
  ];

  return (
    <motion.nav
      ref={ref}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-card/80 dark:bg-card/70 backdrop-blur-xl border-t border-border/70 shadow-top-lg z-[450] flex items-center justify-around px-1"
      style={{ 
        paddingTop: '0.5rem', 
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))', 
        height: 'auto' 
      }}
    >
      {navItems.map((item) => (
        <BottomNavBarItem
          key={item.id}
          icon={item.icon}
          active={activeTab === item.id}
          onClick={() => handleNavigation(item.id)}
          label={item.label}
        />
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out w-16 h-16 text-muted-foreground hover:text-foreground hover:scale-105`}
            aria-label="Mais opções"
          >
            <Avatar className="w-6 h-6 border-2 border-primary/70">
              <AvatarImage src={userProfilePhoto} alt={userDisplayName} />
              <AvatarFallback className="bg-muted text-sm font-bold">
                {getInitials(userDisplayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium opacity-100">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="top" 
          align="end" 
          className="mb-2 w-64 bg-popover/80 dark:bg-popover/70 backdrop-blur-md shadow-lg"
          style={{ marginBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userDisplayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleNavigation('referrals')} className="text-green-500 focus:bg-green-500/10 focus:text-green-500">
              <Gift className="mr-2 h-4 w-4" />
              <span>Indique e Ganhe</span>
            </DropdownMenuItem>
            {isFeatureEnabled('agenda_pro') && (
              <DropdownMenuItem onClick={() => handleNavigation('calendar')}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Agenda</span>
              </DropdownMenuItem>
            )}
            {isFeatureEnabled('quadros') && (
              <DropdownMenuItem onClick={() => handleNavigation('quadros')}>
                <Trello className="mr-2 h-4 w-4" />
                <span>Quadros</span>
              </DropdownMenuItem>
            )}
            {isFeatureEnabled('relatorios') && (
              <DropdownMenuItem onClick={() => handleNavigation('reports')}>
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Relatórios</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ferramentas</DropdownMenuLabel>
             {isFeatureEnabled('precifique') && (
              <DropdownMenuItem onClick={() => handleNavigation('precifique')}>
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Precificar</span>
              </DropdownMenuItem>
            )}
            {isFeatureEnabled('reserva_inteligente') && (
              <DropdownMenuItem onClick={() => handleNavigation('reserva-inteligente')}>
                <PiggyBank className="mr-2 h-4 w-4" />
                <span>Reserva Inteligente</span>
              </DropdownMenuItem>
            )}
            {isFeatureEnabled('meu_setup') && (
              <DropdownMenuItem onClick={() => handleNavigation('my-setup')}>
                <HardDrive className="mr-2 h-4 w-4" />
                <span>Meu Setup</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleInstallApp}>
            <Download className="mr-2 h-4 w-4" />
            <span>Baixar aplicativo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation('settings')}>
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.nav>
  );
});
BottomNavBar.displayName = 'BottomNavBar';
export default BottomNavBar;