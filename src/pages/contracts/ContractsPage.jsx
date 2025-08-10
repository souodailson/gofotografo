// src/pages/contracts/ContractsPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Send } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { sanitizeHTML } from "@/lib/security/sanitize.js";
import SafeHTML from "@/components/SafeHTML.jsx";

const ContractsPage = () => {
  const { clients = [], servicePackages = [], businessInfo } = useData();
  const { toast } = useToast();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState("novo");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServicePackage, setSelectedServicePackage] = useState(null);
  const [customServiceName, setCustomServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicFields, setDynamicFields] = useState({});
  const [includeImageRights, setIncludeImageRights] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);

  const [selectedContractTemplate, setSelectedContractTemplate] = useState(null);
  const [contractTemplates, setContractTemplates] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [assinafyApiKey, setAssinafyApiKey] = useState(null);

  // container do portal (modal de preview)
  const contractPreviewRef = useRef(null);
  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    contractPreviewRef.current = el;
    return () => {
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);

  // buscar templates
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from("modeloscontrato")
        .select("*")
        .eq("status", true);
      if (error) {
        console.error("Error fetching templates:", error);
      } else {
        setContractTemplates(data || []);
      }
    };
    fetchTemplates();
  }, []);

  // pré-seleção de cliente via state da rota
  useEffect(() => {
    const clientId = location?.state?.clientId;
    if (clientId && clients.length > 0) {
      handleClientChange(clientId);
      setSelectedTab("novo");
    }
  }, [location?.state, clients]);

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => String(c.id) === String(clientId));
    setSelectedClient(client || null);
  };

  const handleServicePackageChange = (packageId) => {
    const pkg = servicePackages.find((p) => String(p.id) === String(packageId));
    setSelectedServicePackage(pkg || null);
    setCustomServiceName("");
  };

  const generateFinalContent = useCallback(
    (isPreview = false) => {
      if (!selectedContractTemplate) return "";

      let contentHtml = selectedContractTemplate.htmlContent || "";
      const client = selectedClient;
      const pkg = selectedServicePackage;
      const today = new Date();

      // placeholders
      if (client) {
        contentHtml = contentHtml.replace(/\{\{CLIENT_NAME\}\}/g, client.name ?? "");
        contentHtml = contentHtml.replace(/\{\{CLIENT_EMAIL\}\}/g, client.email ?? "");
        contentHtml = contentHtml.replace(/\{\{CLIENT_PHONE\}\}/g, client.phone ?? "");
      }
      if (pkg) {
        contentHtml = contentHtml.replace(/\{\{SERVICE_NAME\}\}/g, pkg.name ?? "");
        contentHtml = contentHtml.replace(/\{\{SERVICE_PRICE\}\}/g, String(pkg.price ?? ""));
      } else if (customServiceName) {
        contentHtml = contentHtml.replace(/\{\{SERVICE_NAME\}\}/g, customServiceName);
        contentHtml = contentHtml.replace(/\{\{SERVICE_PRICE\}\}/g, "");
      }

      contentHtml = contentHtml.replace(/\{\{NOTES\}\}/g, notes ?? "");
      contentHtml = contentHtml.replace(/\{\{DUE_DATE\}\}/g, dueDate ?? "");
      contentHtml = contentHtml.replace(/\{\{TODAY_DATE\}\}/g, today.toLocaleDateString());

      if (!includeImageRights) {
        contentHtml = contentHtml.replace(/\{\{IMAGE_RIGHTS_SECTION\}\}/g, "");
      }
      if (!includeLogo) {
        contentHtml = contentHtml.replace(/\{\{LOGO_SECTION\}\}/g, "");
      }

      // campos dinâmicos
      for (const [key, value] of Object.entries(dynamicFields)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        contentHtml = contentHtml.replace(placeholder, value ?? "");
      }

      return contentHtml;
    },
    [
      selectedContractTemplate,
      selectedClient,
      selectedServicePackage,
      customServiceName,
      notes,
      dueDate,
      includeImageRights,
      includeLogo,
      dynamicFields,
    ]
  );

  const handleSendContract = async () => {
    if (!selectedClient) {
      toast({
        title: "Selecione um cliente",
        description: "Você deve selecionar um cliente antes de enviar um contrato.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedContractTemplate) {
      toast({
        title: "Selecione um modelo",
        description: "Você deve selecionar um modelo de contrato antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    // Verifica chave da Assinafy (ajuste conforme sua tela de integrações)
    const apiKeyProvided = assinafyApiKey && assinafyApiKey.length > 0;
    if (!apiKeyProvided) {
      toast({
        title: "API Key não configurada",
        description: "Vá para Configurações > Integrações para adicionar sua chave da API Assinafy.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let pdfElement;
    try {
      const content = generateFinalContent(false);

      // cria um container offscreen para rasterizar
      pdfElement = document.createElement("div");
      pdfElement.style.width = "794px"; // largura A4 aprox a 96DPI
      pdfElement.style.position = "fixed";
      pdfElement.style.left = "-10000px";
      pdfElement.innerHTML = sanitizeHTML(content); // 🔒 sanitiza antes de injetar
      document.body.appendChild(pdfElement);

      const canvas = await html2canvas(pdfElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // registra no banco (se for parte do seu fluxo)
      const { error: insertError } = await supabase.from("contratosgerados").insert([
        {
          client_id: selectedClient.id,
          template_id: selectedContractTemplate.id,
          created_at: new Date().toISOString(),
        },
      ]);
      if (insertError) throw insertError;

      // envia via função do Supabase
      const { error: functionError } = await supabase.functions.invoke("assinafy-send-contract", {
        body: {
          pdfBase64,
          contractTitle: selectedContractTemplate.title || "Contrato",
        },
      });
      if (functionError) throw functionError;

      toast({
        title: "Contrato enviado!",
        description: "O contrato foi gerado e enviado para assinatura via Assinafy.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao gerar contrato",
        description: error?.message || "Não foi possível enviar o contrato.",
        variant: "destructive",
      });
    } finally {
      if (pdfElement && document.body.contains(pdfElement)) {
        document.body.removeChild(pdfElement);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Contratos</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="novo">Novo Contrato</TabsTrigger>
          <TabsTrigger value="contratos">Contratos Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="novo">
          <div className="space-y-4">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium">Cliente</label>
              <select
                className="mt-1 block w-full"
                value={selectedClient?.id || ""}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="" disabled>
                  Selecione um cliente
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium">Modelo de Contrato</label>
              <select
                className="mt-1 block w-full"
                value={selectedContractTemplate?.id || ""}
                onChange={(e) => {
                  const templateId = Number(e.target.value);
                  const template = contractTemplates.find((t) => Number(t.id) === templateId);
                  setSelectedContractTemplate(template || null);
                }}
              >
                <option value="" disabled>
                  Selecione um modelo
                </option>
                {contractTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos dinâmicos, se houver */}
            {selectedContractTemplate?.dynamicFields?.length > 0 && (
              <div>
                <h2 className="text-sm font-medium">Informações Adicionais</h2>
                {selectedContractTemplate.dynamicFields.map((fieldKey) => (
                  <div key={fieldKey} className="mt-2">
                    <label className="block text-xs font-medium">{fieldKey}</label>
                    <Input
                      type="text"
                      value={dynamicFields[fieldKey] || ""}
                      onChange={(e) =>
                        setDynamicFields((prev) => ({ ...prev, [fieldKey]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium">Observações</label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais"
              />
            </div>

            {/* Vencimento */}
            <div>
              <label className="block text-sm font-medium">Data de Vencimento</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            {/* Opções */}
            <div className="flex items-center">
              <Checkbox
                id="imageRights"
                checked={includeImageRights}
                onCheckedChange={(v) => setIncludeImageRights(Boolean(v))}
              />
              <label htmlFor="imageRights" className="ml-2 text-sm">
                Incluir cláusula de direitos de imagem
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="includeLogo"
                checked={includeLogo}
                onCheckedChange={(v) => setIncludeLogo(Boolean(v))}
              />
              <label htmlFor="includeLogo" className="ml-2 text-sm">
                Incluir logo da empresa no contrato
              </label>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowPreview(true)}>
                Pré-visualizar
              </Button>

              <Button onClick={handleSendContract} disabled={isLoading} className="flex items-center">
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
          </div>
        </TabsContent>

        <TabsContent value="contratos">
          <p>Aqui você pode ver os contratos enviados recentemente.</p>
          {/* Renderize a lista baseada em `contratosgerados` se quiser */}
        </TabsContent>
      </Tabs>

      {/* Modal de pré-visualização via portal */}
      {showPreview && contractPreviewRef.current
        ? createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
              <div className="bg-white p-6 rounded-md max-w-2xl w-full max-h-[85vh] overflow-auto">
                <h2 className="text-lg font-bold mb-4">Pré-visualização do Contrato</h2>
                <SafeHTML className="prose" html={generateFinalContent(true)} />
                <div className="mt-6 text-right">
                  <Button onClick={() => setShowPreview(false)} className="mr-2">
                    Fechar
                  </Button>
                </div>
              </div>
            </div>,
            contractPreviewRef.current
          )
        : null}
    </div>
  );
};

export default ContractsPage;
