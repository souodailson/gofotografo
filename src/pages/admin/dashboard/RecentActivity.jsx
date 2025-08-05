import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const RecentActivity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchActivity = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-recent-activity');
        if (error) throw error;
        setActivity(data);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [session]);

  const getInitials = (name) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimos logins e ações no sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))
        ) : (
          activity.map((entry) => (
            <div key={entry.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={entry.user_info?.profile_photo} alt={entry.user_info?.full_name} />
                <AvatarFallback>{getInitials(entry.user_info?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {entry.user_info?.full_name || entry.payload?.actor_username || 'Usuário desconhecido'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.payload?.action === 'login' ? 'fez login' : `Ação: ${entry.payload?.action}`}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;