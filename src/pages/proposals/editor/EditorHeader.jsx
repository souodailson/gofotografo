import React from 'react';
import { ArrowLeft, Eye, Save, Send, Download, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const EditorHeader = ({ navigateBack, viewMode, setViewMode, handleExportPdf, handleSave, handlePublish, saving, saveStatus, isAdmin, proposal }) => {
  const { toast } = useToast();
  const proposalId = proposal?.id;
  const isNew = !proposalId;

  const handlePreview = () => {
    if (isNew || !proposalId) {
      toast({
        title: "Salve para visualizar",
        description: "Você precisa salvar a proposta antes de poder visualizá-la.",
        variant: "destructive"
      });
      return;
    }
    const previewUrl = `${window.location.origin}/studio/view/${proposalId}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <header className="bg-background border-b p-2 flex items-center justify-between flex-shrink-0 z-30">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={navigateBack}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{proposal?.nome_da_proposta || 'Nova Proposta'}</h1>
          <p className="text-xs text-muted-foreground">{saveStatus}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('mobile')}><Smartphone /></Button>
        <Button variant={viewMode === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('tablet')}><Tablet /></Button>
        <Button variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('desktop')}><Monitor /></Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={saving || !proposal?.is_published}>
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button variant="outline" onClick={handleExportPdf} disabled={saving}>
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <Button onClick={() => handleSave()} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button onClick={handlePublish} disabled={saving}>
          <Send className="w-4 h-4 mr-2" />
          {saving ? 'Publicando...' : (proposal?.is_published ? 'Republicar' : 'Publicar')}
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;