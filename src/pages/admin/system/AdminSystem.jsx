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
    try {
      // Buscar funcionalidades da tabela original
      const { data: originalFlags, error: originalError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('id');

      // Buscar novas funcionalidades
      const { data: newFlags, error: newError } = await supabase
        .from('system_features')
        .select('*')
        .order('sort_order', { ascending: true });

      if (originalError && originalError.code !== 'PGRST116') {
        console.error('Erro ao buscar funcionalidades originais:', originalError);
        toast({ title: "Erro ao buscar funcionalidades", description: originalError.message, variant: "destructive" });
      }

      if (newError && newError.code !== 'PGRST116') {
        console.error('Erro ao buscar novas funcionalidades:', newError);
      }

      // Combinar ambas as listas, priorizando as originais
      const allFlags = [
        ...(originalFlags || []).map(flag => ({
          ...flag,
          feature_name: flag.label || flag.nome_funcionalidade,
          description: flag.descricao || 'Funcionalidade do sistema',
          category: 'system',
          is_enabled: flag.esta_ativa,
          isOriginal: true
        })),
        ...(newFlags || []).map(flag => ({
          ...flag,
          isOriginal: false
        }))
      ];

      setFeatureFlags(allFlags);
    } catch (error) {
      console.error('Erro geral ao buscar funcionalidades:', error);
      toast({ title: "Erro ao buscar funcionalidades", description: error.message, variant: "destructive" });
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

  const handleFeatureToggle = async (featureId, isEnabled) => {
    const feature = featureFlags.find(f => f.id === featureId);
    if (!feature) return;

    let error;
    
    if (feature.isOriginal) {
      // Atualizar na tabela original
      const { error: originalError } = await supabase
        .from('feature_flags')
        .update({ esta_ativa: isEnabled })
        .eq('id', featureId);
      error = originalError;
    } else {
      // Atualizar na tabela nova
      const { error: newError } = await supabase
        .from('system_features')
        .update({ 
          is_enabled: isEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', featureId);
      error = newError;
    }
    
    if (error) {
      console.error('Erro ao atualizar funcionalidade:', error);
      toast({ title: "Erro ao atualizar funcionalidade", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Sucesso", 
        description: `Funcionalidade ${isEnabled ? 'ativada' : 'desativada'} com sucesso.` 
      });
      
      // Atualizar estado local
      setFeatureFlags(flags => flags.map(f => {
        if (f.id === featureId) {
          return { 
            ...f, 
            is_enabled: isEnabled,
            esta_ativa: isEnabled // Para compatibilidade com ambos os formatos
          };
        }
        return f;
      }));
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
            {loadingFeatures ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando funcionalidades...</span>
              </div>
            ) : featureFlags.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma funcionalidade encontrada</p>
            ) : (
              <div className="space-y-4">
                {/* Funcionalidades Originais do Sistema */}
                {featureFlags.filter(f => f.isOriginal).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Sistema Principal
                    </h4>
                    {featureFlags.filter(f => f.isOriginal).map(feature => (
                      <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={`feature-${feature.id}`} className="font-medium">
                            {feature.feature_name || feature.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feature.description || feature.descricao || 'Funcionalidade do sistema'}
                          </p>
                        </div>
                        <Switch
                          id={`feature-${feature.id}`}
                          checked={feature.is_enabled || feature.esta_ativa}
                          onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Novas Funcionalidades */}
                {featureFlags.filter(f => !f.isOriginal).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Novas Funcionalidades
                    </h4>
                    {featureFlags.filter(f => !f.isOriginal).map(feature => (
                      <div key={feature.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor={`feature-${feature.id}`} className="font-semibold">
                              {feature.feature_name}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {feature.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                feature.category === 'analytics' ? 'bg-blue-100 text-blue-800' :
                                feature.category === 'business' ? 'bg-green-100 text-green-800' :
                                feature.category === 'logistics' ? 'bg-purple-100 text-purple-800' :
                                feature.category === 'locations' ? 'bg-orange-100 text-orange-800' :
                                feature.category === 'creativity' ? 'bg-pink-100 text-pink-800' :
                                feature.category === 'communication' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {feature.category}
                              </span>
                              {feature.requires_subscription && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                          <Switch
                            id={`feature-${feature.id}`}
                            checked={feature.is_enabled}
                            onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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