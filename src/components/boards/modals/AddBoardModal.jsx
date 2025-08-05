import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Loader2, LayoutTemplate, FilePlus, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const boardTemplates = [
  {
    id: 'geral',
    title: 'Produção Fotográfica Geral',
    description: 'Ideal para fotógrafos que lidam com diferentes tipos de ensaio durante a semana.',
    columns: [
      'Leads recebidos',
      'Orçamentos enviados',
      'Clientes confirmados',
      'Pré-produção (checklist, contratos, etc.)',
      'Ensaio realizado',
      'Edição em andamento',
      'Finalizado e entregue',
      'Pós-venda / Reels / Avaliações',
    ],
  },
  {
    id: 'sazonal',
    title: 'Campanha Sazonal (Ex: Natal)',
    description: 'Para organizar campanhas de alta demanda com fluxo intenso.',
    columns: [
      'Interessados',
      'Confirmados / Agendados',
      'A fotografar',
      'A editar',
      'Editado (aguardando aprovação)',
      'Finalizado e entregue',
      'Arquivar / Backup',
      'Pós-venda (depoimento, upsell)',
    ],
  },
  {
    id: 'casamento',
    title: 'Gestão de Casamentos',
    description: 'Workflow completo por casal, com etapas longas e muitas entregas.',
    columns: [
      'Contato inicial',
      'Reunião agendada',
      'Contrato e pagamento',
      'Pré-wedding',
      'Casamento realizado',
      'Seleção das fotos',
      'Álbum em produção',
      'Álbum entregue / finalizado',
    ],
  },
  {
    id: 'marketing',
    title: 'Conteúdo e Marketing Pessoal',
    description: 'Para quem trabalha o Instagram, blog, YouTube, etc.',
    columns: [
      'Ideias brutas',
      'Roteirizado / estruturado',
      'Em produção (gravando/editando)',
      'Agendado / pronto para publicar',
      'Publicado',
      'Reaproveitar (corte, reels, etc.)',
    ],
  },
  {
    id: 'produtos_digitais',
    title: 'Produtos Digitais / Mentorias',
    description: 'Centralize o atendimento a fotógrafos e a venda de infoprodutos.',
    columns: [
      'Interessados / leads',
      'Conversa iniciada',
      'Pagamento pendente',
      'Aluno ativo',
      'Suporte / acompanhamento',
      'Finalizado',
      'Feedback / depoimentos',
    ],
  },
];

const AddBoardModal = ({ isOpen, onOpenChange, onCreate }) => {
  const [step, setStep] = useState('initial'); // 'initial', 'templates', 'custom'
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setStep('initial');
    setNewBoardName('');
    setIsCreating(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleCreate = async (template = null) => {
    if (!newBoardName.trim()) {
      toast({ title: 'Nome inválido', description: 'O nome do quadro não pode ser vazio.', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      const columns = template ? template.columns : [];
      await onCreate(newBoardName, columns);
      handleClose();
    } catch (error) {
      // Error toast is handled in the parent component
    } finally {
      setIsCreating(false);
    }
  };

  const renderInitialStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Criar Novo Quadro</DialogTitle>
        <DialogDescription>
          Comece com um modelo pronto ou crie um quadro em branco.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setStep('templates')}>
          <LayoutTemplate className="w-6 h-6" />
          <span>Usar um Template</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setStep('custom')}>
          <FilePlus className="w-6 h-6" />
          <span>Criar Quadro em Branco</span>
        </Button>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
      </DialogFooter>
    </>
  );

  const renderTemplateStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('initial')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <DialogTitle>Escolha um Template</DialogTitle>
        </div>
        <DialogDescription className="pl-10">
          Selecione um modelo para iniciar seu quadro com colunas pré-definidas.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input
          placeholder="Dê um nome ao seu novo quadro..."
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          className="mb-4"
          disabled={isCreating}
        />
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
            {boardTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleCreate(template)}
                disabled={isCreating || !newBoardName.trim()}
                className="w-full text-left p-3 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <p className="font-semibold">{template.title}</p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );

  const renderCustomStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('initial')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <DialogTitle>Criar Quadro em Branco</DialogTitle>
        </div>
        <DialogDescription className="pl-10">
          Isso criará um quadro vazio e um atalho na sua mesa de trabalho.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input
          placeholder="Ex: Planejamento de Viagem..."
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          disabled={isCreating}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={isCreating}>Cancelar</Button>
        <Button onClick={() => handleCreate()} disabled={isCreating || !newBoardName.trim()}>
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Criar Quadro
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => { if (isCreating) e.preventDefault(); }}>
        {step === 'initial' && renderInitialStep()}
        {step === 'templates' && renderTemplateStep()}
        {step === 'custom' && renderCustomStep()}
      </DialogContent>
    </Dialog>
  );
};

export default AddBoardModal;