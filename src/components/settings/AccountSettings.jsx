import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const AccountSettings = ({ isMobile }) => {
  const { settings, user, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>
            Você está atualmente no plano{' '}
            <span className="font-semibold text-custom-gradient">
              {settings?.plan_status || 'Não identificado'}
            </span>
            .
            {settings?.plan_status === 'TRIAL' && settings.trial_ends_at && (
              <>
                {' '}Seu período de teste termina em{' '}
                {new Date(settings.trial_ends_at).toLocaleDateString('pt-BR')}.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/plans')}>Ver Planos e Upgrade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Conta</CardTitle>
          <CardDescription>
            Informações da sua conta e como você pode gerenciá-las.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <span className="text-foreground">{user?.email}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Nome de Usuário</span>
            <span className="text-foreground">{settings?.user_name || 'Não definido'}</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/politica-de-privacidade-e-dados')}>
            Ler Política de Dados e Privacidade
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
          <CardDescription>
            Gerencie sua sessão ativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            Sair da Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;