import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, FileText, Edit, Trash2, Globe, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/authContext';

const SiteManagerPage = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar páginas',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPages(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (pageId) => {
    const { error } = await supabase.from('custom_pages').delete().eq('id', pageId);
    if (error) {
      toast({
        title: 'Erro ao deletar página',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Página deletada',
        description: 'A página foi removida com sucesso.',
      });
      fetchPages();
    }
  };

  const PageCardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciador de Site</h1>
        <Button onClick={() => navigate('/control-acess/site/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Página
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <PageCardSkeleton key={i} />)
          : pages.map((page) => (
              <Card key={page.id} className="flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-1">{page.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <Badge variant={page.is_published ? 'success' : 'secondary'}>
                      {page.is_published ? 'Publicada' : 'Rascunho'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center mt-auto pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    <p>Tipo: {page.page_type}</p>
                    <p>Criada em: {format(new Date(page.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`/${page.page_type === 'tutorial' ? 'tutoriais' : 'p'}/${page.slug}`, '_blank')}
                      disabled={!page.is_published}
                      title="Visualizar página"
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/control-acess/site/edit/${page.id}`)}
                       title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Deletar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá deletar permanentemente a página "{page.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(page.id)}>
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      {!loading && pages.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma página criada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Comece a construir seu site adicionando uma nova página.</p>
            <div className="mt-6">
                <Button onClick={() => navigate('/control-acess/site/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Criar primeira página
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagerPage;