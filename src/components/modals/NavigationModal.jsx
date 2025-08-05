import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Users, Briefcase, Wallet, Calendar, BarChart2, Settings2, HardDrive, DollarSign as DollarSignIcon, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const navItems = [
  { id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard },
  { id: 'workflow', text: 'Trabalhos', icon: Briefcase },
  { id: 'clients', text: 'Clientes', icon: Users },
  { id: 'financial', text: 'Financeiro', icon: Wallet },
  { id: 'calendar', text: 'Agenda', icon: Calendar },
  { id: 'reports', text: 'Relatórios', icon: BarChart2 },
  { id: 'service-packages', text: 'Pacotes', icon: Briefcase },
  { id: 'my-setup', text: 'Meu Setup', icon: HardDrive },
  { id: 'precifique', text: 'Precifique', icon: DollarSignIcon },
  { id: 'reserva-inteligente', text: 'Reserva Inteligente', icon: PiggyBank },
  { id: 'settings', text: 'Configurações', icon: Settings2 },
  { id: 'account-settings', text: 'Minha Conta', icon: Settings2 },
];

const NavigationModal = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { user } = useData();

  if (!user) return null;

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    onClose(); // Fecha o modal após a navegação
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Navegação Rápida</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-destructive">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <nav className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start text-base py-6 rounded-lg 
                        ${activeTab === item.id 
                          ? 'btn-custom-gradient text-white shadow-md hover:opacity-95' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <item.icon className="w-5 h-5 mr-4" />
                      {item.text}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationModal;