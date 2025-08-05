import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Check, Send } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ContractsPage = () => {
  const { clients, servicePackages, businessInfo } = useData();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState('novo');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);
  const [customServiceName, setCustomServiceName] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicFields, setDynamicFields] = useState({});
  const [includeImageRights, setIncludeImageRights] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);

  const [selectedContractTemplate, setSelectedContractTemplate] = useState(null);
  const [contractTemplates, setContractTemplates] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [placeholderImage, setPlaceholderImage] = useState(null);

  const [assinafyApiKey, setAssinafyApiKey] = useState(null);

  const contractPreviewRef = useRef(null);

  // Fetch contract templates on mount (if user is logged in)
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('modeloscontrato')
        .select('*')
        .eq('status', true);
      if (error) {
        console.error('Error fetching templates:', error);
      } else {
        setContractTemplates(data || []);
      }
    };
    fetchTemplates();
  }, []);

  // Preselect a client if coming from client page with state
  useEffect(() => {
    const { clientId } = location.state || {};
    if (clientId && clients.length > 0) {
      handleClientChange(clientId);
    }
  }, [location.state, clients]);

  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleServicePackageChange = (packageId) => {
    const packageItem = servicePackages.find(p => p.id === packageId);
    setSelectedServicePackage(packageItem || null);
    setCustomServiceName('');
  };

  const generateFinalContent = useCallback((isPreview = false) => {
    // This function generates the final HTML content for the contract,
    // replacing placeholders in the template with actual data.
    if (!selectedContractTemplate) return '';

    let contentHtml = selectedContractTemplate.htmlContent || '';
    const client = selectedClient;
    const packageItem = selectedServicePackage;
    const today = new Date();

    // Basic placeholders replacements
    if (client) {
      contentHtml = contentHtml.replace(/\{\{CLIENT_NAME\}\}/g, client.name);
      contentHtml = contentHtml.replace(/\{\{CLIENT_EMAIL\}\}/g, client.email);
      contentHtml = contentHtml.replace(/\{\{CLIENT_PHONE\}\}/g, client.phone || '');
    }
    if (packageItem) {
      contentHtml = contentHtml.replace(/\{\{SERVICE_NAME\}\}/g, packageItem.name);
      contentHtml = contentHtml.replace(/\{\{SERVICE_PRICE\}\}/g, packageItem.price?.toString() || '');
    } else if (customServiceName) {
      contentHtml = contentHtml.replace(/\{\{SERVICE_NAME\}\}/g, customServiceName);
      contentHtml = contentHtml.replace(/\{\{SERVICE_PRICE\}\}/g, '');
    }
    contentHtml = contentHtml.replace(/\{\{NOTES\}\}/g, notes);
    contentHtml = contentHtml.replace(/\{\{DUE_DATE\}\}/g, dueDate);
    contentHtml = contentHtml.replace(/\{\{TODAY_DATE\}\}/g, today.toLocaleDateString());

    // Include or exclude certain sections based on checkboxes
    if (!includeImageRights) {
      contentHtml = contentHtml.replace(/\{\{IMAGE_RIGHTS_SECTION\}\}/g, '');
    }
    if (!includeLogo) {
      contentHtml = contentHtml.replace(/\{\{LOGO_SECTION\}\}/g, '');
    }

    // Dynamic fields replacement
    for (const [key, value] of Object.entries(dynamicFields)) {
      const placeholder = `{{${key}}}`;
      contentHtml = contentHtml.replaceAll(placeholder, value);
    }

    return contentHtml;
  }, [selectedContractTemplate, selectedClient, selectedServicePackage, customServiceName, notes, dueDate, includeImageRights, includeLogo, dynamicFields]);

  const handleSendContract = async () => {
    if (!selectedClient) {
      toast({ title: "Selecione um cliente", description: "Você deve selecionar um cliente antes de enviar um contrato.", variant: "destructive" });
      return;
    }
    if (!selectedContractTemplate) {
      toast({ title: "Selecione um modelo", description: "Você deve selecionar um modelo de contrato antes de enviar.", variant: "destructive" });
      return;
    }

    // Check if Assinafy API key is configured
    const apiKeyProvided = assinafyApiKey && assinafyApiKey.length > 0;
    if (!apiKeyProvided) {
      toast({
        title: "API Key não configurada",
        description: "Vá para Configurações > Integrações para adicionar sua chave da API Assinafy.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    let pdfElement;
    try {
      const content = generateFinalContent(false);

      pdfElement = document.createElement("div");
      pdfElement.style.width = "794px"; // A4 width in pixels at 96 DPI (approx)
      pdfElement.innerHTML = content;
      document.body.appendChild(pdfElement);

      const canvas = await html2canvas(pdfElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      // Save contract record to database (optional, depending on system design)
      const { data: contractData, error: insertError } = await supabase
        .from('contratosgerados')
        .insert([{
          client_id: selectedClient.id,
          template_id: selectedContractTemplate.id,
          created_at: new Date().toISOString()
        }]);
      if (insertError) {
        throw insertError;
      }

      // Send contract via Assinafy using Supabase Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('assinafy-send-contract', {
        body: {
          pdfBase64: pdfBase64,
          contractTitle: selectedContractTemplate.title || 'Contrato'
        }
      });
      if (functionError) {
        throw functionError;
      }

      // On success, navigate to contracts list or show success message
      toast({ title: "Contrato enviado!", description: "O contrato foi gerado e enviado para assinatura via Assinafy.", variant: "success" });
      // Optionally, navigate or update state to show the list or the contract status
      // navigate('/contracts');  // If using react-router to go back to contracts list page
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao gerar contrato", description: error.message || "Não foi possível enviar o contrato.", variant: "destructive" });
    } finally {
      if (pdfElement && document.body.contains(pdfElement)) {
        document.body.removeChild(pdfElement);
      }
      setIsLoading(false);
    }
  };

  const handleNextTab = () => {
    setSelectedTab('contratos');
  };

  // ... (Other handlers and rendering logic for preview modal, etc.)

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Contratos</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="novo">Novo Contrato</TabsTrigger>
          <TabsTrigger value="contratos">Contratos Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="novo">
          {/* Formulário para criar novo contrato */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Cliente</label>
              <select
                className="mt-1 block w-full"
                value={selectedClient?.id || ''}
                onChange={e => handleClientChange(Number(e.target.value))}
              >
                <option value="" disabled>Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Modelo de Contrato</label>
              <select
                className="mt-1 block w-full"
                value={selectedContractTemplate?.id || ''}
                onChange={e => {
                  const templateId = Number(e.target.value);
                  const template = contractTemplates.find(t => t.id === templateId);
                  setSelectedContractTemplate(template || null);
                }}
              >
                <option value="" disabled>Selecione um modelo</option>
                {contractTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
            </div>

            {/* Additional form fields for dynamic fields if any */}
            {/* Example dynamic field handling (if dynamicFields is an object of { placeholder: value }) */}
            {selectedContractTemplate && selectedContractTemplate.dynamicFields?.length > 0 && (
              <div>
                <h2 className="text-sm font-medium">Informações Adicionais</h2>
                {selectedContractTemplate.dynamicFields.map(fieldKey => (
                  <div key={fieldKey} className="mt-2">
                    <label className="block text-xs font-medium">{fieldKey}</label>
                    <Input
                      type="text"
                      value={dynamicFields[fieldKey] || ''}
                      onChange={e => setDynamicFields(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Observações</label>
              <Input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações adicionais"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Data de Vencimento</label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <Checkbox
                id="imageRights"
                checked={includeImageRights}
                onCheckedChange={value => setIncludeImageRights(Boolean(value))}
              />
              <label htmlFor="imageRights" className="ml-2 text-sm">Incluir cláusula de direitos de imagem</label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="includeLogo"
                checked={includeLogo}
                onCheckedChange={value => setIncludeLogo(Boolean(value))}
              />
              <label htmlFor="includeLogo" className="ml-2 text-sm">Incluir logo da empresa no contrato</label>
            </div>

            <Button onClick={handleSendContract} disabled={isLoading} className="mt-4 flex items-center">
              {isLoading ? (
                <>
                  <ArrowRight className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Enviar Contrato
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contratos">
          {/* Lista de contratos enviados */}
          <p>Aqui você pode ver os contratos enviados recentemente.</p>
          {/* The list of sent contracts can be rendered here, possibly using data from `contratosgerados` table */}
        </TabsContent>
      </Tabs>

      {/* Optionally, a preview modal portal for contract content */}
      // ... imports e lógicas anteriores permanecem iguais

{showPreview && contractPreviewRef.current && createPortal(
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-md max-w-2xl w-full">
      <h2 className="text-lg font-bold mb-4">Pré-visualização do Contrato</h2>
      <div dangerouslySetInnerHTML={{ __html: generateFinalContent(true) }} />
      <div className="mt-4 text-right">
        <Button onClick={() => setShowPreview(false)} className="mr-2">Fechar</Button>
        {/* Botão de download pode ser adicionado futuramente com @react-pdf/renderer */}
      </div>
    </div>
  </div>,
  contractPreviewRef.current
)}

    </div>
  );
};

export default ContractsPage;
