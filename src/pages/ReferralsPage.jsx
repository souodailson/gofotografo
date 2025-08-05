import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Gift, Users, CheckCircle, Clock, XCircle, ArrowRight, Loader2, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card className="bg-card/50 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ReferralsPage = () => {
  const { user, settings } = useData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState({ referrals: [], commissions: [] });
  const [affiliateSettings, setAffiliateSettings] = useState(null);
  const [referralLink, setReferralLink] = useState('');

  const fetchAffiliateData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [referralsRes, commissionsRes, settingsRes] = await Promise.all([
        supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('commissions').select('*, referral:referrals(referred_name, referred_email)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_settings').select('*').eq('id', 1).single()
      ]);

      if (referralsRes.error) throw referralsRes.error;
      if (commissionsRes.error) throw commissionsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setAffiliateData({ referrals: referralsRes.data, commissions: commissionsRes.data });
      setAffiliateSettings(settingsRes.data);
      
      if(settings?.referral_code) {
        setReferralLink(`${window.location.origin}/signup?ref=${settings.referral_code}`);
      }

    } catch (error) {
      toast({ title: 'Erro ao buscar dados de afiliados', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, settings, toast]);

  useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Link copiado!', description: 'Seu link de indicação foi copiado para a área de transferência.' });
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'subscribed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusLabel = (status) => {
    const labels = {
        'registered': 'Registrado',
        'subscribed': 'Assinante',
        'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  const getCommissionStatusLabel = (status) => {
    const labels = {
        'pending': 'Pendente',
        'paid': 'Paga',
        'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  const stats = {
    totalReferrals: affiliateData.referrals.length,
    subscribedReferrals: affiliateData.referrals.filter(r => r.status === 'subscribed').length,
    pendingCommissions: affiliateData.commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + Number(c.amount), 0),
    paidCommissions: affiliateData.commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.amount), 0)
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground titulo-gradiente flex items-center gap-2">
                <Gift className="w-8 h-8" />
                Programa de Afiliados
            </h1>
            <p className="text-muted-foreground mt-1">Indique amigos e ganhe comissões por cada novo assinante.</p>
        </div>
        <Button onClick={() => window.open(affiliateSettings?.program_rules, '_blank')} variant="outline">
            <LinkIcon className="w-4 h-4 mr-2" />
            Ver Regras do Programa
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Seu Link de Indicação</CardTitle>
          <CardDescription>Compartilhe este link para começar a ganhar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={referralLink} readOnly className="bg-muted" />
            <Button onClick={copyToClipboard} size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Indicados" value={stats.totalReferrals} icon={Users} description="Pessoas que se cadastraram com seu link." />
        <StatCard title="Indicados Assinantes" value={stats.subscribedReferrals} icon={CheckCircle} description="Indicados que se tornaram assinantes." />
        <StatCard title="Comissão Pendente" value={`R$ ${stats.pendingCommissions.toFixed(2)}`} icon={Clock} description="Comissões aguardando liberação." />
        <StatCard title="Total Pago" value={`R$ ${stats.paidCommissions.toFixed(2)}`} icon={BarChart3} description="Valor total de comissões pagas." />
      </div>

      <Tabs defaultValue="referrals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrals">Minhas Indicações</TabsTrigger>
          <TabsTrigger value="commissions">Minhas Comissões</TabsTrigger>
        </TabsList>
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Indicados</CardTitle>
              <CardDescription>Acompanhe o status de todas as pessoas que você indicou.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateData.referrals.map(referral => (
                    <TableRow key={referral.id}>
                      <TableCell>{referral.referred_name || 'Não informado'}</TableCell>
                      <TableCell>{referral.referred_email}</TableCell>
                      <TableCell>{format(new Date(referral.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell className="flex items-center gap-2">
                          {getStatusIcon(referral.status)}
                          {getStatusLabel(referral.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Comissões</CardTitle>
              <CardDescription>Veja o histórico de suas comissões.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicado</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Liberação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateData.commissions.map(commission => (
                    <TableRow key={commission.id}>
                      <TableCell>{commission.referral?.referred_name || commission.referral?.referred_email || 'N/A'}</TableCell>
                      <TableCell>R$ {Number(commission.amount).toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(commission.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{getCommissionStatusLabel(commission.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-blue-900/20 border-blue-500">
        <CardHeader>
          <CardTitle>Como Funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center">1</div>
            <p>Compartilhe seu link de indicação único com amigos, colegas e em suas redes sociais.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center">2</div>
            <p>Quando alguém se cadastra e se torna um assinante pago (plano Pro ou superior) através do seu link, você ganha uma comissão.</p>
          </div>
           <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center">3</div>
            <p>Sua comissão é de <strong>{affiliateSettings?.commission_percentage || 0}%</strong> sobre o valor da primeira mensalidade paga pelo seu indicado.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center">4</div>
            <p>A comissão fica pendente por <strong>{affiliateSettings?.payout_waiting_days || 0} dias</strong> (período de garantia) e depois é liberada para saque.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralsPage;