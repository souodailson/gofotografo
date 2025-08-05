import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LifeBuoy, BarChart, FileText, Bot, Palette, ShoppingCart, Megaphone, Globe } from 'lucide-react';

import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard';
import AdminUsers from '@/pages/admin/users/AdminUsers';
import AdminSystem from '@/pages/admin/system/AdminSystem';
import AdminSupportPage from '@/pages/admin/support/AdminSupportPage';
import ProposalTemplatesManager from '@/pages/admin/proposals/ProposalTemplatesManager';
import ContractTemplatesManager from '@/pages/admin/ContractTemplatesManager';
import AdminBlog from '@/pages/admin/blog/AdminBlog';
import AdminIntegrations from '@/pages/admin/integrations/AdminIntegrations';
import AdminMarketing from '@/pages/admin/marketing/AdminMarketing';
import AdminBugsPage from '@/pages/admin/bugs/AdminBugsPage';
import SiteManagerPage from '@/pages/admin/site/SiteManagerPage';
import PageEditor from '@/pages/admin/site/PageEditor';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('gofotografo_admin_auth');
    navigate('/control-acess/login');
  };

  const navItems = [
    { path: '/control-acess/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/control-acess/users', label: 'Usuários', icon: Users },
    { path: '/control-acess/support', label: 'Suporte', icon: LifeBuoy },
    { path: '/control-acess/bugs', label: 'Bugs', icon: Bot },
    { path: '/control-acess/site', label: 'Site', icon: Globe },
    { path: '/control-acess/marketing', label: 'Marketing', icon: Megaphone },
    { path: '/control-acess/blog', label: 'Blog', icon: FileText },
    { path: '/control-acess/proposal-templates', label: 'Propostas', icon: Palette },
    { path: '/control-acess/contract-templates', label: 'Contratos', icon: FileText },
    { path: '/control-acess/integrations', label: 'Integrações', icon: BarChart },
    { path: '/control-acess/system', label: 'Sistema', icon: Settings },
  ];
  
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button variant={isActive(item.path) ? 'secondary' : 'ghost'} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="w-full" onClick={handleLogout}>Sair</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="proposal-templates" element={<ProposalTemplatesManager />} />
          <Route path="contract-templates" element={<ContractTemplatesManager />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="bugs" element={<AdminBugsPage />} />
          <Route path="site" element={<SiteManagerPage />} />
          <Route path="site/new" element={<PageEditor />} />
          <Route path="site/edit/:pageId" element={<PageEditor />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;