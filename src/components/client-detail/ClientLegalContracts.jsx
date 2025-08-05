import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, FileText, Trash2, Link as LinkIcon, AlertTriangle, CheckCircle, PlusCircle, Edit3, MoreVertical, FileSpreadsheet } from 'lucide-react';
import { sanitizeFilename } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import OrcamentoModal from '@/components/modals/OrcamentoModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center text-lg font-semibold text-primary mb-4 mt-6 border-b border-border pb-2">
    <Icon className="w-5 h-5 mr-2" />
    {title}
  </div>
);

const ClientLegalContracts = ({ formData }) => { 
  const { toast } = useToast();
  const { user, clientContracts, addClientContract, deleteClientContract, refreshClientContracts, clientOrcamentos, refreshClientOrcamentos, deleteOrcamento } = useData();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOrcamentoModalOpen, setIsOrcamentoModalOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState(null);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);


  const clientId = formData.id; 

  useEffect(() => {
    if (clientId) {
      if (refreshClientContracts) refreshClientContracts(clientId);
      if (refreshClientOrcamentos) refreshClientOrcamentos(clientId);
    }
  }, [clientId, refreshClientContracts, refreshClientOrcamentos]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadContract = async () => {
    if (!selectedFile || !user || !clientId) {
      toast({
        title: "Atenção",
        description: "Selecione um arquivo e certifique-se de que o cliente está carregado.",
        variant: "warning",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const originalFileName = selectedFile.name;
    const sanitizedBaseName = sanitizeFilename(originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName);
    const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
    const uniqueId = uuidv4().substring(0, 8);
    const uniqueSanitizedFileName = `${sanitizedBaseName}_${uniqueId}${extension}`;
    
    const filePath = `${user.id}/${clientId}/${uniqueSanitizedFileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type,
          onUploadProgress: (progress) => {
            if (progress.total) {
              setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
            }
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública do arquivo.");
      }
      
      const newContract = {
        client_id: clientId,
        user_id: user.id,
        nome_arquivo: originalFileName,
        url_arquivo: publicUrlData.publicUrl,
      };

      await addClientContract(newContract);

      toast({
        title: "Sucesso!",
        description: "Contrato anexado com sucesso.",
        variant: "success",
        icon: <CheckCircle className="h-5 w-5" />,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      refreshClientContracts(clientId);

    } catch (error) {
      console.error("Erro no upload ou registro do contrato:", error);
      toast({
        title: "Erro ao anexar contrato",
        description: error.message || "Ocorreu um problema. Tente novamente.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteContract = async (contractId, contractUrl) => {
    if (!contractUrl) {
        toast({ title: "Erro", description: "URL do arquivo inválida.", variant: "destructive" });
        return;
    }

    const urlParts = contractUrl.split('/contracts/');
    if (urlParts.length < 2) {
        toast({ title: "Erro", description: "Formato da URL do arquivo inválido.", variant: "destructive" });
        return;
    }
    const storagePath = urlParts[1];

    try {
        await deleteClientContract(contractId, storagePath);
        toast({
            title: "Sucesso",
            description: "Contrato excluído com sucesso.",
            variant: "success",
            icon: <CheckCircle className="h-5 w-5" />,
        });
        refreshClientContracts(clientId);
    } catch (error) {
        toast({
            title: "Erro ao excluir contrato",
            description: error.message,
            variant: "destructive",
            icon: <AlertTriangle className="h-5 w-5" />,
        });
    }
  };

  const openOrcamentoModal = (orcamento = null) => {
    setEditingOrcamento(orcamento);
    setIsOrcamentoModalOpen(true);
  };

  const closeOrcamentoModal = () => {
    setEditingOrcamento(null);
    setIsOrcamentoModalOpen(false);
  };

  const confirmDeleteOrcamento = (orcamento) => {
    setOrcamentoToDelete(orcamento);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteOrcamentoConfirmed = async () => {
    if (orcamentoToDelete) {
      try {
        await deleteOrcamento(orcamentoToDelete.id);
        toast({
          title: "Sucesso",
          description: "Orçamento excluído com sucesso.",
          variant: "success",
          icon: <CheckCircle className="h-5 w-5" />,
        });
        refreshClientOrcamentos(clientId);
      } catch (error) {
        toast({
          title: "Erro ao excluir orçamento",
          description: error.message,
          variant: "destructive",
          icon: <AlertTriangle className="h-5 w-5" />,
        });
      }
    }
    setIsDeleteAlertOpen(false);
    setOrcamentoToDelete(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida'
    }
  };

  return (
    <div className="space-y-6">
      {/* Contratos Anexados */}
      <SectionTitle icon={FileText} title="Contratos Anexados" />
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/50">
        <Label htmlFor="contract-upload" className="block text-sm font-medium text-muted-foreground mb-2">
          Anexar Novo Contrato (PDF, DOCX, etc.)
        </Label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            id="contract-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            disabled={isUploading}
          />
          <Button onClick={handleUploadContract} disabled={!selectedFile || isUploading} className="w-full sm:w-auto btn-custom-gradient">
            <UploadCloud className="w-4 h-4 mr-2" />
            {isUploading ? `Enviando... ${uploadProgress}%` : 'Anexar Contrato'}
          </Button>
        </div>
        {isUploading && (
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {selectedFile && !isUploading && (
          <p className="text-xs text-muted-foreground mt-2">Arquivo selecionado: {selectedFile.name}</p>
        )}
      </div>

      {clientContracts && clientContracts.length > 0 ? (
        <ul className="space-y-3">
          {clientContracts.map((contract) => (
            <li key={contract.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-md shadow-sm hover:shadow-md transition-shadow">
              <a
                href={contract.url_arquivo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline truncate"
                title={contract.nome_arquivo}
              >
                <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{contract.nome_arquivo || 'Contrato sem nome'}</span>
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteContract(contract.id, contract.url_arquivo)}
                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
                title="Excluir contrato"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum contrato anexado a este cliente.</p>
      )}

      {/* Orçamentos Enviados */}
      <SectionTitle icon={FileSpreadsheet} title="Orçamentos Enviados" />
      <div className="flex justify-end mb-4">
        <Button onClick={() => openOrcamentoModal()} className="btn-custom-gradient">
          <PlusCircle className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </div>

      {clientOrcamentos && clientOrcamentos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Envio</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">PDF</th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {clientOrcamentos.map((orcamento) => (
                <tr key={orcamento.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{orcamento.descricao_servico}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{formatCurrency(orcamento.valor)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{formatDate(orcamento.data_envio)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${orcamento.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 
                        orcamento.status === 'Recusado' ? 'bg-red-100 text-red-800' : 
                        orcamento.status === 'Visto' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {orcamento.link_pdf ? (
                      <a href={orcamento.link_pdf} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <LinkIcon className="w-4 h-4 inline-block" /> Ver PDF
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openOrcamentoModal(orcamento)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Editar Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDeleteOrcamento(orcamento)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum orçamento enviado para este cliente.</p>
      )}

      {isOrcamentoModalOpen && (
        <OrcamentoModal
          isOpen={isOrcamentoModalOpen}
          onClose={closeOrcamentoModal}
          clientId={clientId}
          editingOrcamento={editingOrcamento}
          onSuccess={() => {
            closeOrcamentoModal();
            if (refreshClientOrcamentos) refreshClientOrcamentos(clientId);
          }}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrcamentoToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrcamentoConfirmed} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ClientLegalContracts;