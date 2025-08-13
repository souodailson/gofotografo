import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, Wallet, Calendar, BarChart2, LogOut, Settings2, Gem, HardDrive, DollarSign as DollarSignIcon, PiggyBank, Trello, FileText, Gift, DraftingCompass, Route, Lightbulb, CalendarDays, MessageSquare, MapPin, Target, Trophy, Compass } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const NavItem = ({ icon: Icon, text, active, onClick, collapsed, isBottomIcon = false, hideActiveIndicator = false, customStyle = '', activeStyle = '' }) => (
  <li
    className={cn(`
      relative flex items-center py-2 px-3 font-medium rounded-md cursor-pointer
      transition-colors group text-sm`,
      active
        ? (activeStyle || 'bg-primary text-primary-foreground')
        : `text-muted-foreground/80 dark:text-foreground/80 hover:bg-accent hover:text-accent-foreground ${isBottomIcon && collapsed ? 'py-2 justify-center' : ''}`,
      customStyle
    )}
    onClick={onClick}
  >
    <Icon className={`w-4 h-4 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
    {!collapsed && <span className="transition-opacity duration-300">{text}</span>}
    
    {!collapsed && active && !hideActiveIndicator && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -left-1 w-1 h-5 bg-button-primary-foreground rounded-r-md"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
     {collapsed && (
      <span
        className="absolute left-full rounded-md px-2 py-1 ml-4 bg-gray-900 text-white text-sm
        invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap"
      >
        {text}
      </span>
    )}
  </li>
);

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, logout, settings, isFeatureEnabled } = useData();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        // Redirecionar para login após logout bem-sucedido
        navigate('/login', { replace: true });
      }
    } catch (error) {
      // Erro de logout será tratado pelo contexto auth
    }
  };

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', feature: null },
    { id: 'workflow', text: 'Trabalhos', icon: Briefcase, path: '/workflow', feature: null },
    { id: 'clients', text: 'Clientes', icon: Users, path: '/clients', feature: null },
    { id: 'financial', text: 'Financeiro', icon: Wallet, path: '/financial', feature: null },
    { id: 'calendar', text: 'Agenda', icon: Calendar, path: '/calendar', feature: 'agenda_pro' },
    { id: 'reports', text: 'Relatórios', icon: BarChart2, path: '/reports', feature: 'relatorios' },
    { id: 'service-packages', text: 'Pacotes', icon: Briefcase, path: '/service-packages', feature: 'pacotes_servico' },
    { id: 'my-setup', text: 'Meu Setup', icon: HardDrive, path: '/my-setup', feature: 'meu_setup' },
    { id: 'precifique', text: 'Precifique', icon: DollarSignIcon, path: '/precifique', feature: 'precifique' },
    { id: 'reserva-inteligente', text: 'Reserva', icon: PiggyBank, path: '/reserva-inteligente', feature: 'reserva_inteligente' },
  ].filter(item => !item.feature || isFeatureEnabled(item.feature));
  
  const userDisplayName = settings?.user_name || user?.user_metadata?.full_name || user?.email || 'Usuário';
  const userEmail = settings?.contact_email || user?.email || 'Não informado';
  const userProfilePhoto = settings?.profile_photo || user?.user_metadata?.avatar_url;

  const logoUrlDarkTheme = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20fundo%20escuro%20gofotografo.png";
  const logoUrlLightTheme = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20gofotografo%20claro.png";
  const collapsedLogoUrl = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//favicon%20gofotografo.png";
  
  // Sempre usar o logotipo original do sistema
  const displayLogoFull = theme === 'dark' ? logoUrlDarkTheme : logoUrlLightTheme;
  const displayLogoCollapsed = collapsedLogoUrl;


  const handleUserAreaClick = () => {
    setActiveTab('account-settings');
    navigate('/account-settings');
  };
  
  const handleNavClick = (id, path) => {
    setActiveTab(id);
    navigate(path);
    if (id === 'quadros' && !collapsed) {
      setCollapsed(true);
    } else if (id !== 'quadros' && collapsed && path.startsWith('/quadros') === false) {
      
    }
  };

  const showUpgradeButton = false;

  return (
    <motion.nav
      initial={false}
      animate={{ width: collapsed ? '4rem' : '16rem' }}
      className={`
        h-screen bg-card border-r border-border 
        flex flex-col p-2 transition-width duration-300 ease-in-out fixed left-0 top-0 z-30 hidden md:flex
      `}
    >
      <div className="flex items-center justify-center h-16 pt-4 mb-4">
        <Link to="/dashboard" onClick={() => handleNavClick('dashboard', '/dashboard')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={collapsed ? 'collapsed' : 'full'}
              src={collapsed ? displayLogoCollapsed : displayLogoFull}
              alt="Logotipo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`transition-all duration-300 ${collapsed ? 'h-8 w-auto' : 'h-9 w-auto'}`}
            />
          </AnimatePresence>
        </Link>
      </div>
      
      <ul className="flex-grow space-y-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            text={item.text}
            active={activeTab === item.id}
            onClick={() => handleNavClick(item.id, item.path)}
            collapsed={collapsed}
            customStyle={item.customStyle}
          />
        ))}
      </ul>
      
      {showUpgradeButton && (
        <div className={`my-2 ${collapsed ? 'px-0' : 'px-1'}`}>
          <Button 
            onClick={() => handleNavClick('plans', '/plans')} 
            className={`w-full text-yellow-700 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600 bg-yellow-400/20 dark:bg-yellow-500/10 backdrop-blur-sm hover:bg-yellow-400/30 dark:hover:bg-yellow-500/20
                        ${collapsed ? 'justify-center p-2' : 'py-2'} border shadow-md`}
            title="Fazer Upgrade"
            variant="outline"
          >
            <Gem className={`w-4 h-4 ${!collapsed ? 'mr-1.5' : ''}`} />
            {!collapsed && <span className="text-xs font-bold">Upgrade</span>}
          </Button>
        </div>
      )}

      <div className="border-t border-border/50 my-2"></div>

      {isFeatureEnabled('propostas_avancadas') && (
        <div className="mb-2">
          <NavItem
            icon={DraftingCompass}
            text="GO.STUDIO"
            active={activeTab === 'studio'}
            onClick={() => handleNavClick('studio', '/studio')}
            collapsed={collapsed}
          />
        </div>
      )}

      {isFeatureEnabled('quadros') && (
        <div className="mb-2">
          <NavItem
            icon={Trello}
            text="Quadros"
            active={activeTab === 'quadros'}
            onClick={() => handleNavClick('quadros', '/quadros')}
            collapsed={collapsed}
            hideActiveIndicator={false}
          />
        </div>
      )}

      <div className="mb-2">
        <NavItem
          icon={Gift}
          text="Indique e Ganhe"
          active={activeTab === 'referrals'}
          onClick={() => handleNavClick('referrals', '/referrals')}
          collapsed={collapsed}
          customStyle="border border-green-500/50 text-green-400 hover:bg-green-500/10 rounded-md"
          activeStyle="bg-green-500/10 text-green-400"
          hideActiveIndicator={true}
        />
      </div>


      <div className="mt-auto border-t border-border pt-2">
        <div
          className={`
            flex items-center p-2 rounded-lg cursor-pointer
            ${collapsed ? 'justify-center' : 'justify-start'}
            hover:bg-accent transition-colors group
          `}
          onClick={handleUserAreaClick}
          title="Minha Conta"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground border-2 border-button-primary-foreground overflow-hidden flex-shrink-0">
             {userProfilePhoto ? <img src={userProfilePhoto} alt={userDisplayName} className="w-full h-full object-cover" /> : userDisplayName?.charAt(0).toUpperCase()}
          </div>

          {!collapsed && (
            <div className="ml-2 overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">{userDisplayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
           {collapsed && (
            <span
              className="absolute left-full rounded-md px-2 py-1 ml-4 bg-gray-900 text-white text-sm
              invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap"
            >
              {userDisplayName}
            </span>
          )}
        </div>
        
        <div className={`flex ${collapsed ? 'flex-col items-center space-y-1' : 'items-center justify-around'} mt-1`}>
          <NavItem
            icon={Settings2}
            text="Configurações"
            active={activeTab === 'settings'}
            onClick={() => handleNavClick('settings', '/settings')}
            collapsed={collapsed}
            isBottomIcon={true}
          />
           <NavItem
            icon={LogOut}
            text="Sair"
            active={false} 
            onClick={handleLogout}
            collapsed={collapsed}
            isBottomIcon={true}
          />
        </div>
      </div>
    </motion.nav>
  );
};

export default Sidebar;