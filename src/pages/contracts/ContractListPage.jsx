import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Download, RefreshCw, Trash2, Loader2, FileText, FilePlus, Edit, BookOpen, Search, GraduationCap, HeartHandshake, Baby, Cake, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const ContractListPage = () => {
  const { user, getClientById, refreshData, contratos } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingStatus, setLoadingStatus] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [contractTemplates, setContractTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshData('contratos');
  }, [refreshData]);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'assinado': return 'success';
      case 'pendente': return 'warning';
      case 'recusado': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const handleCheckStatus = async (contract) => {
    if (!contract.id_assinatura_assinafy) {
      toast({ title: 'Atenção', description: 'Este contrato não foi enviado para assinatura eletrônica.', variant: 'destructive' });
      return;
    }
    setLoadingStatus(prev => ({ ...prev, [contract.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('assinafy-check-status', {
        body: { documentId: contract.id_assinatura_assinafy, user_id: user.id }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({ title: 'Status atualizado!', description: `O status do contrato agora é: ${data.status}` });
      await refreshData('contratos');
    } catch (error) {
      toast({ title: 'Erro ao verificar status', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingStatus(prev => ({ ...prev, [contract.id]: false }));
    }
  };

  const handleDeleteContract = async (contractId) => {
    setDeletingId(contractId);
    try {
      const { error } = await supabase.from('contratosgerados').delete().eq('id', contractId);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Contrato excluído com sucesso.' });
      await refreshData('contratos');
    } catch (error) {
      toast({ title: 'Erro', description: `Não foi possível excluir o contrato: ${error.message}`, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateNew = async (type) => {
    setIsCreateModalOpen(false);
    if (type === 'blank') {
      navigate('/studio/contracts/new');
    } else {
      const { data, error } = await supabase
        .from('modeloscontrato')
        .select('*')
        .or('status.eq.publico', `user_id.eq.${user.id}`);
      
      if(error) {
        toast({ title: "Erro", description: "Não foi possível carregar os modelos de contrato.", variant: "destructive" });
        return;
      }
      setContractTemplates(data);
      setIsTemplateModalOpen(true);
    }
  };

  const handleUseTemplate = async (template) => {
    setIsTemplateModalOpen(false);
    try {
        const { data, error } = await supabase
          .from('contratosgerados')
          .insert({ 
            id_fotografo: user.id, 
            id_modelo: template.id,
            titulo_contrato: `${template.nome_modelo} (Cópia)`, 
            conteudo_final: template.conteudo_template, 
            status_assinatura: 'draft',
          })
          .select()
          .single();
        if (error) throw error;
        await refreshData('contratos');
        navigate(`/studio/contracts/edit/${data.id}`);
    } catch (error) {
        toast({ title: 'Erro ao criar contrato do modelo', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleEditContract = (contract) => {
    navigate(`/studio/contracts/edit/${contract.id}`);
  }
  
  const handleRowClick = (contract) => {
    if (contract.status_assinatura === 'draft' || !contract.status_assinatura) {
      handleEditContract(contract);
    }
  };

  const getIconForTemplate = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('casamento') || lowerTitle.includes('noivos')) {
      return <HeartHandshake className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('formatura')) {
      return <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('parto') || lowerTitle.includes('nascimento') || lowerTitle.includes('newborn')) {
      return <Baby className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('aniversário') || lowerTitle.includes('festa')) {
      return <Cake className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    if (lowerTitle.includes('ensaio')) {
      return <Camera className="w-5 h-5 text-primary flex-shrink-0" />;
    }
    return <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />;
  };

  const filteredTemplates = contractTemplates.filter(template => 
    template.nome_modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Contratos</h1>
          <p className="text-muted-foreground">Gerencie todos os seus contratos gerados.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>Visualize, acompanhe o status e gerencie seus contratos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título do Contrato</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de Geração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos && contratos.length > 0 ? (
                contratos.map((contract) => (
                  <TableRow key={contract.id} onClick={() => handleRowClick(contract)} className="cursor-pointer">
                    <TableCell className="font-medium">{contract.titulo_contrato}</TableCell>
                    <TableCell>{getClientById(contract.id_cliente)?.name || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(contract.data_geracao), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(contract.status_assinatura)}>
                        {contract.status_assinatura || 'Não enviado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                           <DropdownMenuItem onClick={() => handleEditContract(contract)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                           </DropdownMenuItem>
                          {contract.link_documento_final_assinafy && (
                            <DropdownMenuItem asChild>
                              <a href={contract.link_documento_final_assinafy} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Baixar Assinado
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleCheckStatus(contract)} disabled={loadingStatus[contract.id]}>
                            {loadingStatus[contract.id] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Verificar Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteContract(contract.id)} className="text-red-500" disabled={deletingId === contract.id}>
                             {deletingId === contract.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="h-24 text-center">
                    Nenhum contrato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Contrato</DialogTitle>
            <DialogDescription>Como você gostaria de começar?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-28 flex flex-col gap-2 text-center" onClick={() => handleCreateNew('blank')}>
              <FilePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Criar em Branco</span>
            </Button>
            <Button variant="outline" className="h-28 flex flex-col gap-2 text-center" onClick={() => handleCreateNew('template')}>
              <FileText className="w-8 h-8" />
              <span className="text-sm font-medium">Usar um Modelo</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
           <DialogHeader>
            <DialogTitle>Galeria de Modelos de Contrato</DialogTitle>
            <DialogDescription>Escolha um modelo para começar. Você poderá editá-lo completamente.</DialogDescription>
          </DialogHeader>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Buscar por nome ou nicho..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <ScrollArea className="flex-grow pr-4 -mr-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {filteredTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                       <CardTitle className="text-base flex items-start gap-2">
                         {getIconForTemplate(template.nome_modelo)}
                         <span className="flex-1">{template.nome_modelo}</span>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-xs text-muted-foreground line-clamp-3">{template.description || "Este modelo não possui uma descrição."}</p>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ContractListPage;