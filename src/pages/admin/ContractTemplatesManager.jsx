import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Globe, Lock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const ContractTemplatesManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modeloscontrato')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao buscar modelos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTemplates(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (templateId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
      const { error } = await supabase
        .from('modeloscontrato')
        .delete()
        .eq('id', templateId);

      if (error) {
        toast({
          title: "Erro ao excluir modelo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Modelo excluído!",
          description: "O modelo de contrato foi removido com sucesso.",
        });
        fetchTemplates();
      }
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modelos de Contrato</CardTitle>
          <Button onClick={() => navigate('/control-acess/contract-templates/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Modelo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome do Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4"><Loader2 className="mx-auto animate-spin" /></td></tr>
                ) : templates.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4">Nenhum modelo encontrado.</td></tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{template.nome_modelo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(template.data_criacao || Date.now()), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={template.status === 'publico' ? 'success' : 'secondary'}>
                           {template.status === 'publico' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {template.status === 'publico' ? 'Público' : 'Privado'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/control-acess/contract-templates/edit/${template.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractTemplatesManager;