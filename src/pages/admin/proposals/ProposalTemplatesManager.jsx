import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const nichePlaceholders = {
  default: 'https://images.unsplash.com/photo-1511285560921-5ae97c6abc7c?q=80&w=1280&auto=format&fit=crop',
  casamento: 'https://images.unsplash.com/photo-1597158269292-6f811526f7c5?q=80&w=1280&auto=format&fit=crop',
  gestante: 'https://images.unsplash.com/photo-1594895185918-a834162985ce?q=80&w=1280&auto=format&fit=crop',
  aniversario: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1280&auto=format&fit=crop',
  ensaio: 'https://images.unsplash.com/photo-1500336996925-4201b1a565c6?q=80&w=1280&auto=format&fit=crop',
  corporativo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1280&auto=format&fit=crop',
};

const TemplateCard = ({ template, onDuplicate, onDelete }) => {
  const navigate = useNavigate();
  const getCoverImage = () => {
    if (template.thumbnail_url) return template.thumbnail_url;
    const nicheKey = template.category?.toLowerCase();
    if (nicheKey && nichePlaceholders[nicheKey]) {
      return nichePlaceholders[nicheKey];
    }
    return nichePlaceholders.default;
  };
  const coverImage = getCoverImage();
  const isIllustrative = !template.thumbnail_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg group"
    >
      <img src={coverImage} alt={template.template_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      
      {isIllustrative && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Capa ilustrativa
          </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-bold truncate">{template.template_name}</h3>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={() => onDuplicate(template)}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full" onClick={() => navigate(`/control-acess/proposal-templates/edit/${template.id}`)}>
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o modelo de proposta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(template.id)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

const ProposalTemplatesManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar modelos", description: error.message, variant: "destructive" });
    } else {
      setTemplates(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDuplicate = async (templateToDuplicate) => {
    if (!templateToDuplicate) return;

    const { id, created_at, updated_at, user_id, ...newTemplateData } = templateToDuplicate;
    newTemplateData.template_name = `${newTemplateData.template_name} (Cópia)`;

    const { error } = await supabase.from('proposal_templates').insert(newTemplateData);
    if (error) {
      toast({ title: "Erro ao duplicar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Modelo duplicado!" });
      fetchTemplates();
    }
  };

  const handleDelete = async (templateId) => {
    const { error } = await supabase.from('proposal_templates').delete().eq('id', templateId);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Modelo excluído!" });
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Modelos de Proposta</h1>
        <Button onClick={() => navigate('/proposals/new?isAdmin=true')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Novo Modelo
        </Button>
      </div>

      {templates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum modelo criado ainda</h2>
          <p className="text-muted-foreground mt-2 mb-6">Crie modelos para agilizar a criação de propostas para os usuários.</p>
          <Button size="lg" onClick={() => navigate('/proposals/new?isAdmin=true')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar meu primeiro modelo
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProposalTemplatesManager;