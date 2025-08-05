import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { v4 as uuidv4 } from 'uuid';

const AdminMarketing = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnuncio, setCurrentAnuncio] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchAnuncios = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('anuncios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAnuncios(data);
    } catch (error) {
      toast({ title: "Erro ao buscar anúncios", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnuncios();
  }, [fetchAnuncios]);

  const handleNewAnuncio = () => {
    setCurrentAnuncio({
      titulo_anuncio: '',
      conteudo_anuncio: '',
      imagem_url: '',
      link_botao: '',
      link_imagem: '',
      esta_ativo: false,
      tamanho_anuncio: 'medium',
      posicao_anuncio: 'center',
      duracao_exibicao_segundos: 15,
      cooldown_reaparicao_minutos: 60,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (anuncio) => {
    setCurrentAnuncio(anuncio);
    setIsModalOpen(true);
  };

  const handleDelete = async (anuncioId, imageUrl) => {
    try {
      if (imageUrl) {
        const path = new URL(imageUrl).pathname.split('/anuncios-banners/')[1];
        if (path) {
            await supabase.storage.from('anuncios-banners').remove([path]);
        }
      }
      const { error } = await supabase.from('anuncios').delete().eq('id', anuncioId);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Anúncio excluído." });
      fetchAnuncios();
    } catch (error) {
      toast({ title: "Erro ao excluir anúncio", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (anuncio) => {
    try {
      const { error } = await supabase.from('anuncios').update({ esta_ativo: !anuncio.esta_ativo }).eq('id', anuncio.id);
      if (error) throw error;
      toast({ title: "Sucesso", description: `Anúncio ${!anuncio.esta_ativo ? 'ativado' : 'desativado'}.` });
      fetchAnuncios();
    } catch (error) {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!currentAnuncio) return;
    try {
      const { id, ...updates } = currentAnuncio;
      let response;
      if (id) {
        response = await supabase.from('anuncios').update(updates).eq('id', id);
      } else {
        response = await supabase.from('anuncios').insert(updates);
      }
      if (response.error) throw response.error;
      toast({ title: "Sucesso", description: "Anúncio salvo." });
      setIsModalOpen(false);
      fetchAnuncios();
    } catch (error) {
      toast({ title: "Erro ao salvar anúncio", description: error.message, variant: "destructive" });
    }
  };

  const handleUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setIsUploading(true);
    try {
      const filePath = `public/${uuidv4()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('anuncios-banners').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('anuncios-banners').getPublicUrl(filePath);
      setCurrentAnuncio(prev => ({ ...prev, imagem_url: publicUrl }));
      toast({ title: "Sucesso", description: "Banner enviado." });
    } catch (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketing e Anúncios</h1>
        <Button onClick={handleNewAnuncio}>
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Anúncio
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Anúncios Criados</CardTitle>
          <CardDescription>Gerencie os anúncios que são exibidos para os usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : anuncios.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">Nenhum anúncio criado ainda.</p>
          ) : (
            <div className="space-y-4">
              {anuncios.map(anuncio => (
                <Card key={anuncio.id} className="flex items-center p-4 justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={anuncio.imagem_url || 'https://via.placeholder.com/100x50'} alt={anuncio.titulo_anuncio} className="w-24 h-12 object-cover rounded-md" />
                    <div>
                      <p className="font-semibold">{anuncio.titulo_anuncio}</p>
                      <p className="text-sm text-muted-foreground">{anuncio.esta_ativo ? 'Ativo' : 'Inativo'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleActive(anuncio)} title={anuncio.esta_ativo ? 'Desativar' : 'Ativar'}>
                      {anuncio.esta_ativo ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-gray-500" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(anuncio)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o anúncio.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(anuncio.id, anuncio.imagem_url)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentAnuncio?.id ? 'Editar Anúncio' : 'Criar Novo Anúncio'}</DialogTitle>
          </DialogHeader>
          {currentAnuncio && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="titulo" className="text-right">Título</Label>
                <Input id="titulo" value={currentAnuncio.titulo_anuncio} onChange={(e) => setCurrentAnuncio(p => ({ ...p, titulo_anuncio: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="conteudo" className="text-right">Conteúdo</Label>
                <Textarea id="conteudo" value={currentAnuncio.conteudo_anuncio || ''} onChange={(e) => setCurrentAnuncio(p => ({ ...p, conteudo_anuncio: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="banner" className="text-right">Banner</Label>
                <div className="col-span-3 space-y-2">
                  <Input id="banner" type="file" onChange={handleUpload} disabled={isUploading} accept="image/*" />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {currentAnuncio.imagem_url && <img src={currentAnuncio.imagem_url} alt="Preview" className="w-full h-auto max-h-40 object-contain rounded-md mt-2" />}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link_imagem" className="text-right">Link da Imagem</Label>
                <Input id="link_imagem" value={currentAnuncio.link_imagem || ''} onChange={(e) => setCurrentAnuncio(p => ({ ...p, link_imagem: e.target.value }))} className="col-span-3" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link_botao" className="text-right">Link do Botão</Label>
                <Input id="link_botao" value={currentAnuncio.link_botao || ''} onChange={(e) => setCurrentAnuncio(p => ({ ...p, link_botao: e.target.value }))} className="col-span-3" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tamanho" className="text-right">Tamanho</Label>
                <Select value={currentAnuncio.tamanho_anuncio || 'medium'} onValueChange={(v) => setCurrentAnuncio(p => ({ ...p, tamanho_anuncio: v }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="posicao" className="text-right">Posição</Label>
                <Select value={currentAnuncio.posicao_anuncio || 'center'} onValueChange={(v) => setCurrentAnuncio(p => ({ ...p, posicao_anuncio: v }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Topo Esquerda</SelectItem>
                    <SelectItem value="top-center">Topo Centro</SelectItem>
                    <SelectItem value="top-right">Topo Direita</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="bottom-left">Baixo Esquerda</SelectItem>
                    <SelectItem value="bottom-center">Baixo Centro</SelectItem>
                    <SelectItem value="bottom-right">Baixo Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duracao" className="text-right">Duração (segundos)</Label>
                <Input id="duracao" type="number" value={currentAnuncio.duracao_exibicao_segundos || 0} onChange={(e) => setCurrentAnuncio(p => ({ ...p, duracao_exibicao_segundos: parseInt(e.target.value, 10) || 0 }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cooldown" className="text-right">Cooldown (minutos)</Label>
                <Input id="cooldown" type="number" value={currentAnuncio.cooldown_reaparicao_minutos || 0} onChange={(e) => setCurrentAnuncio(p => ({ ...p, cooldown_reaparicao_minutos: parseInt(e.target.value, 10) || 0 }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ativo" className="text-right">Ativo</Label>
                <Switch id="ativo" checked={currentAnuncio.esta_ativo} onCheckedChange={(c) => setCurrentAnuncio(p => ({ ...p, esta_ativo: c }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketing;