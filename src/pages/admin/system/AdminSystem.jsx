import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const AdminSystem = () => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false, message: '' });
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useData();

  const fetchFeatureFlags = useCallback(async () => {
    setLoadingFeatures(true);
    const { data, error } = await supabase.from('feature_flags').select('*').order('id');
    if (error) {
      toast({ title: "Erro ao buscar funcionalidades", description: error.message, variant: "destructive" });
    } else {
      setFeatureFlags(data);
    }
    setLoadingFeatures(false);
  }, [toast]);

  const fetchMaintenanceStatus = useCallback(async () => {
    setLoadingMaintenance(true);
    const { data, error } = await supabase.from('system_status').select('*').eq('id', 1).single();
    if (error) {
      toast({ title: "Erro ao buscar modo de manutenção", description: error.message, variant: "destructive" });
    } else if (data) {
      setMaintenanceMode({ enabled: data.maintenance_mode_enabled, message: data.maintenance_message });
    }
    setLoadingMaintenance(false);
  }, [toast]);

  useEffect(() => {
    fetchFeatureFlags();
    fetchMaintenanceStatus();
  }, [fetchFeatureFlags, fetchMaintenanceStatus]);

  const handleFeatureToggle = async (featureId, isActive) => {
    const { error } = await supabase.from('feature_flags').update({ esta_ativa: isActive }).eq('id', featureId);
    if (error) {
      toast({ title: "Erro ao atualizar funcionalidade", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Status da funcionalidade atualizado." });
      setFeatureFlags(flags => flags.map(f => f.id === featureId ? { ...f, esta_ativa: isActive } : f));
    }
  };

  const handleSaveMaintenanceMode = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('system_status')
      .update({ 
        maintenance_mode_enabled: maintenanceMode.enabled, 
        maintenance_message: maintenanceMode.message,
        last_updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      toast({ title: "Erro ao salvar modo de manutenção", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Modo de manutenção atualizado." });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades</CardTitle>
            <CardDescription>Ative ou desative módulos do sistema para todos os usuários.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingFeatures ? <p>Carregando...</p> : featureFlags.map(feature => (
              <div key={feature.id} className="flex items-center justify-between">
                <Label htmlFor={`feature-${feature.id}`}>{feature.label}</Label>
                <Switch
                  id={`feature-${feature.id}`}
                  checked={feature.esta_ativa}
                  onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modo de Manutenção</CardTitle>
            <CardDescription>Coloque o sistema em modo de manutenção. Apenas administradores poderão acessar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMaintenance ? <p>Carregando...</p> : (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Ativar Modo de Manutenção</Label>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode.enabled}
                    onCheckedChange={(checked) => setMaintenanceMode(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="Ex: Estamos realizando uma manutenção programada. Voltamos em breve!"
                    value={maintenanceMode.message}
                    onChange={(e) => setMaintenanceMode(prev => ({ ...prev, message: e.target.value }))}
                    disabled={!maintenanceMode.enabled}
                  />
                </div>
                <Button onClick={handleSaveMaintenanceMode} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSystem;