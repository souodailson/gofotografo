import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, Palette, Upload, Trello } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BoardKanbanView from './BoardKanbanView';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from 'uuid';

const imagensDeFundoPadrao = [
  "https://images.unsplash.com/photo-1753037626414-e8054960fad5?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1716927111848-56163afc0107?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1734983235410-cbbc5f5fcdaf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1749680287741-243118ed6b2c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1750126833705-ba98013f16f3?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1746937807433-05748b80caf4?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

const BoardDetail = ({ setPageStyle }) => {
  const { boardId } = useParams();
  const { user } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const updatePageStyle = useCallback((boardData) => {
    if (boardData && boardData.imagem_fundo) {
      setPageStyle({
        backgroundImage: `url(${boardData.imagem_fundo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      });
    } else {
      setPageStyle({});
    }
  }, [setPageStyle]);


  const fetchBoardData = useCallback(async () => {
    if (!user || !boardId) return;
    setLoading(true);
    try {
      const { data: boardData, error: boardError } = await supabase
        .from('quadros')
        .select('*')
        .eq('id', boardId)
        .single();
      if (boardError) {
        if (boardError.code === 'PGRST116') {
          toast({ title: 'Quadro não encontrado', description: 'Este quadro pode ter sido excluído.', variant: 'destructive' });
          navigate('/quadros');
        } else {
          throw boardError;
        }
        return;
      }
      setBoard(boardData);
      setBoardName(boardData.nome_quadro);
      updatePageStyle(boardData);
    } catch (error) {
      if (error && error.code !== 'PGRST116') {
        toast({ title: 'Erro ao carregar quadro', description: error.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }, [boardId, user, toast, navigate, updatePageStyle]);

  useEffect(() => {
    fetchBoardData();
    return () => {
      setPageStyle({});
    };
  }, [fetchBoardData, setPageStyle]);

  const handleUpdateBoardName = async () => {
    if (!boardName.trim()) {
      toast({ title: 'Nome inválido', description: 'O nome do quadro não pode ser vazio.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('quadros').update({ nome_quadro: boardName }).eq('id', boardId);
      if (error) throw error;
      setEditingBoardName(false);
      setBoard(prev => ({...prev, nome_quadro: boardName}));
      toast({ title: 'Quadro atualizado!', description: 'O nome do quadro foi alterado com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteBoard = async () => {
    setIsDeleting(true);
    try {
      await supabase.from('quadros').delete().eq('id', boardId);
      toast({ title: 'Quadro excluído!', description: 'O quadro foi removido com sucesso.' });
      navigate('/quadros');
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const updateBoardBackground = async (imageUrl) => {
    try {
      const { error } = await supabase.from('quadros').update({ imagem_fundo: imageUrl }).eq('id', boardId);
      if (error) throw error;
      toast({ title: 'Sucesso!', description: 'Imagem de fundo atualizada.' });
      fetchBoardData();
    } catch (error) {
      toast({ title: 'Erro ao atualizar fundo', description: error.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `public/board-backgrounds/${user.id}/${boardId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('user_assets').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('user_assets').getPublicUrl(filePath);
      const imageUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
      
      await updateBoardBackground(imageUrl);
    } catch (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!board) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Trello className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-destructive">Quadro não encontrado</h2>
            <p className="text-muted-foreground mt-2">O quadro que você está procurando não existe ou foi removido.</p>
            <Button asChild className="mt-6">
                <Link to="/quadros">Voltar para Meus Quadros</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 overflow-hidden">
            {editingBoardName ? (
              <Input
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onBlur={handleUpdateBoardName}
                onKeyPress={e => e.key === 'Enter' && handleUpdateBoardName()}
                className="bg-transparent text-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl font-bold w-full p-0 h-auto"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold text-white cursor-pointer truncate"
                onClick={() => setEditingBoardName(true)}
                title={boardName}
              >
                {boardName}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUploading} className="text-white hover:bg-white/20">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Alterar Fundo</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Imagens Padrão</DropdownMenuLabel>
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {imagensDeFundoPadrao.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-video rounded-md cursor-pointer overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                        onClick={() => updateBoardBackground(imgUrl)}
                      >
                        <img src={imgUrl} alt={`Fundo Padrão ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    <span>Fazer upload de imagem</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
            
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 hover:text-red-400">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Excluir Quadro</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o quadro, junto com todas as suas colunas e cartões.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteBoard} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
      
      <div className="flex-grow overflow-auto pt-20">
        <BoardKanbanView board={board} />
      </div>
    </div>
  );
};

export default BoardDetail;