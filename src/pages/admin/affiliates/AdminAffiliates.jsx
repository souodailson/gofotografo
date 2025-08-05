import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, CheckCircle, Gift } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminAffiliates = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    commission_percentage: 0,
    payout_waiting_days: 30,
    program_rules: '',
    is_active: false,
  });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAffiliateData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('affiliate_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      if (settingsData) setSettings(settingsData);

      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*, referral:referrals(referred_name, referred_email), referrer:settings(user_name, contact_email, pix_key)')
        .order('due_date', { ascending: true });
      if (commissionsError) throw commissionsError;
      setCommissions(commissionsData || []);

    } catch (error) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSwitchChange = (checked) => {
    setSettings(prev => ({ ...prev, is_active: checked }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('affiliate_settings')
        .upsert({ ...settings, id: 1 }, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Configurações salvas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao salvar configurações', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsPaid = async (commissionId) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', commissionId);
      if (error) throw error;
      toast({ title: 'Comissão marcada como paga!' });
      fetchAffiliateData();
    } catch (error) {
      toast({ title: 'Erro ao marcar comissão como paga', description: error.message, variant: 'destructive' });
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pendente</Badge>;
      case 'available': return <Badge variant="success">Disponível</Badge>;
      case 'paid': return <Badge variant="outline">Paga</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };


  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center"><Gift className="w-8 h-8 mr-3 text-primary" /> Gerenciar Afiliados</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Programa</CardTitle>
          <CardDescription>Defina as regras e o status do programa de afiliados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="is_active" checked={settings.is_active} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="is_active">Programa Ativo</Label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commission_percentage">Porcentagem da Comissão (%)</Label>
              <Input id="commission_percentage" name="commission_percentage" type="number" value={settings.commission_percentage} onChange={handleSettingsChange} />
            </div>
            <div>
              <Label htmlFor="payout_waiting_days">Prazo para Liberação (dias)</Label>
              <Input id="payout_waiting_days" name="payout_waiting_days" type="number" value={settings.payout_waiting_days} onChange={handleSettingsChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="program_rules">Regras do Programa</Label>
            <Textarea id="program_rules" name="program_rules" value={settings.program_rules} onChange={handleSettingsChange} rows={5} />
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões a Pagar</CardTitle>
          <CardDescription>Gerencie e pague as comissões pendentes e disponíveis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Indicado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Liberação</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length > 0 ? (
                commissions.map(com => (
                  <TableRow key={com.id}>
                    <TableCell>{com.referrer?.user_name || com.referrer?.contact_email}</TableCell>
                    <TableCell>{com.referrer?.pix_key || 'Não cadastrada'}</TableCell>
                    <TableCell>{com.referral?.referred_name || com.referral?.referred_email}</TableCell>
                    <TableCell>R$ {parseFloat(com.amount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(com.status)}</TableCell>
                    <TableCell>{format(new Date(com.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>
                      {com.status === 'available' && (
                        <Button size="sm" onClick={() => handleMarkAsPaid(com.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Paga
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center">Nenhuma comissão encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAffiliates;