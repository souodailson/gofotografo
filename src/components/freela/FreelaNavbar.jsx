import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Home, User, Briefcase, MessageCircle, Heart, PlusCircle, Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useFreela } from '@/contexts/FreelaContext';
import { useAuth } from '@/contexts/authContext';
import FreelaJobModal from './FreelaJobModal';

const FreelaNavbar = ({ activeTab, onTabChange }) => {
  const { profile, notifications, loadJobs } = useFreela();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadJobs({ search: searchQuery.trim() });
      onTabChange('feed');
    }
  };

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'my-jobs', label: 'Meus Trabalhos', icon: Briefcase },
    { id: 'applications', label: 'Candidaturas', icon: PlusCircle },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FREELA
              </h1>
            </motion.div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar trabalhos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`relative ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.id === 'messages' && unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1 min-w-[20px] h-5 text-xs bg-red-500 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Post Job Button */}
              <Button
                onClick={() => setIsJobModalOpen(true)}
                className="hidden md:flex bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Publicar Trabalho
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-4 text-xs bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notificações</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.slice(0, 5).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 border-b">
                        <div>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{notification.message}</div>
                        </div>
                      </DropdownMenuItem>
                    )) || (
                      <DropdownMenuItem className="p-3 text-center text-gray-500">
                        Nenhuma notificação
                      </DropdownMenuItem>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.profile_image_url} alt={profile?.name} />
                      <AvatarFallback>
                        {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onTabChange('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar trabalhos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Post Job Button - Mobile */}
              <Button
                onClick={() => {
                  setIsJobModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white justify-start"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Publicar Trabalho
              </Button>

              {/* Navigation Items */}
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start relative ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : ''
                  }`}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.id === 'messages' && unreadCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Job Modal */}
      <FreelaJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
      />
    </>
  );
};

export default FreelaNavbar;