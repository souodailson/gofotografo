import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Activity, BarChart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RecentActivity from './RecentActivity';
import UserStats from './UserStats';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    novosUsuariosSemana: 0,
    usuariosAtivosHoje: 0,
    planos: {}
  });
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-admin-dashboard-stats');
        if (error) throw error;
        setStats(data);
      } catch (error) {
        toast({
          title: "Erro ao buscar estatísticas",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, toast]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard do Administrador</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsuarios}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários (7 dias)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.novosUsuariosSemana}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.usuariosAtivosHoje}</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats.planos?.PRO || 0) + (stats.planos?.PREMIUM || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <UserStats stats={stats} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;