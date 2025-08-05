import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const IntegrationsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assinafyApiKey, setAssinafyApiKey] = useState('');

  const fetchSecrets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-decrypted-secret', {
        body: { secret_name: 'ASSINAFY_API_KEY' },
      });
      if (error) {
        if (error.message.includes("No rows found")) {
          console.log("Nenhuma chave da API da Assinafy encontrada ainda.");
          setAssinafyApiKey('');
        } else {
          throw error;
        }
      }
      if (data && data.decrypted_value) {
        setAssinafyApiKey(data.decrypted_value);
      }
    } catch (error) {
       console.error("Erro ao buscar segredo:", error);
       toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível buscar as chaves de API existentes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleSaveSecrets = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('set-secret', {
        body: { secret_name: 'ASSINAFY_API_KEY', secret_value: assinafyApiKey },
      });
      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Chave da API da Assinafy salva com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar chave da API',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Integrações e APIs</CardTitle>
          <CardDescription>
            Configure as chaves de API para serviços de terceiros integrados à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando configurações...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveSecrets} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assinafy</h3>
                <div className="space-y-2">
                  <Label htmlFor="assinafy-api-key">Chave da API (Token)</Label>
                  <Input
                    id="assinafy-api-key"
                    type="password"
                    value={assinafyApiKey}
                    onChange={(e) => setAssinafyApiKey(e.target.value)}
                    placeholder="Cole sua chave da API da Assinafy aqui"
                  />
                  <p className="text-sm text-muted-foreground">
                    Sua chave da API é armazenada de forma segura e criptografada.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Chave
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IntegrationsManager;