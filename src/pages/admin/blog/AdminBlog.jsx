import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Loader2, Globe, EyeOff, Eye, BookOpenCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '@/contexts/DataContext';
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

const PostEditorModal = ({ post, onSave, onClose, adminUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    cover_image_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_published: false,
    slug: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        cover_image_url: post.cover_image_url || '',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        seo_keywords: post.seo_keywords || '',
        is_published: post.is_published || false,
        slug: post.slug || ''
      });
    } else {
       setFormData({
        title: '', content: '', cover_image_url: '', seo_title: '', seo_description: '', seo_keywords: '', is_published: false, slug: ''
      });
    }
  }, [post]);
  
  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
     const newTitle = e.target.value;
     const newSlug = generateSlug(newTitle);
     setFormData(prev => ({...prev, title: newTitle, slug: newSlug}));
  }

  const handleImageUpload = async () => {
    if (!coverImageFile) return formData.cover_image_url;
    const fileName = `public/blog-covers/${uuidv4()}-${coverImageFile.name}`;
    const { data, error } = await supabase.storage.from('user_assets').upload(fileName, coverImageFile);
    if (error) {
      throw new Error('Falha no upload da imagem de capa.');
    }
    const { data: { publicUrl } } = supabase.storage.from('user_assets').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      const finalData = { 
        ...formData, 
        cover_image_url: imageUrl,
        author_id: adminUser.id,
        author_name: adminUser.user_metadata?.full_name || 'Admin',
        published_at: formData.is_published && !post?.is_published ? new Date().toISOString() : post?.published_at,
      };
      await onSave(finalData, post?.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader><DialogTitle>{post ? 'Editar Post' : 'Criar Novo Post'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" value={formData.title} onChange={handleTitleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="slug">URL (slug)</Label>
                            <Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Imagem de Capa</Label>
                        {formData.cover_image_url && <img src={formData.cover_image_url} alt="Capa atual" className="w-full h-24 object-cover rounded-md" />}
                        <Input type="file" onChange={(e) => setCoverImageFile(e.target.files[0])} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="content">Conteúdo (Markdown)</Label>
                    <Textarea id="content" value={formData.content} onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))} rows={15} required />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">SEO</h3>
                    <div className="space-y-2">
                         <div>
                            <Label htmlFor="seo_title">Título SEO</Label>
                            <Input id="seo_title" value={formData.seo_title} onChange={(e) => setFormData(prev => ({...prev, seo_title: e.target.value}))} />
                        </div>
                         <div>
                            <Label htmlFor="seo_description">Descrição SEO</Label>
                            <Textarea id="seo_description" value={formData.seo_description} onChange={(e) => setFormData(prev => ({...prev, seo_description: e.target.value}))} rows={2}/>
                        </div>
                         <div>
                            <Label htmlFor="seo_keywords">Palavras-chave (separadas por vírgula)</Label>
                            <Input id="seo_keywords" value={formData.seo_keywords} onChange={(e) => setFormData(prev => ({...prev, seo_keywords: e.target.value}))} />
                        </div>
                    </div>
                </div>

            </div>
            <DialogFooter className="pt-4 border-t mt-4">
                <div className="flex items-center space-x-2 mr-auto">
                    <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData(prev => ({...prev, is_published: checked}))} />
                    <Label htmlFor="is_published">Publicar Post</Label>
                </div>
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
};


const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { toast } = useToast();
  const { refreshData, session } = useData();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao buscar posts', description: error.message, variant: 'destructive' });
    } else {
      setPosts(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSavePost = async (formData, postId) => {
    let error;
    if (postId) {
      ({ error } = await supabase.from('blog_posts').update(formData).eq('id', postId));
    } else {
      ({ error } = await supabase.from('blog_posts').insert([formData]));
    }
    
    if (error) {
      toast({ title: `Erro ao ${postId ? 'atualizar' : 'criar'} post`, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Post ${postId ? 'atualizado' : 'criado'} com sucesso!` });
      await fetchPosts();
      await refreshData('blog_posts');
    }
  };

  const confirmDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', postToDelete.id);
    if (error) {
      toast({ title: 'Erro ao deletar post', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post deletado com sucesso!' });
      await fetchPosts();
      await refreshData('blog_posts');
    }
    setPostToDelete(null);
    setShowDeleteConfirm(false);
  };
  
  const handleTogglePublish = async (post) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : null
      })
      .eq('id', post.id);

    if (error) {
        toast({ title: 'Erro ao alterar status', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: `Post ${!post.is_published ? 'publicado' : 'despublicado'} com sucesso.` });
        await fetchPosts();
        await refreshData('blog_posts');
    }
  };
  
  const handleCreateSamplePosts = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.functions.invoke('create-blog-posts', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Posts de exemplo foram criados." });
        await fetchPosts();
    } catch (error) {
        toast({ title: "Erro ao criar posts", description: error.message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  const handleOpenEditor = (post = null) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {isEditorOpen && <PostEditorModal post={selectedPost} onSave={handleSavePost} onClose={() => setIsEditorOpen(false)} adminUser={session.user} />}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciador do Blog</h1>
        <div className="flex items-center space-x-2">
            <Button onClick={handleCreateSamplePosts} variant="outline" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpenCheck className="mr-2 h-4 w-4" />} Criar Posts de Exemplo
            </Button>
            <Button onClick={() => handleOpenEditor()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Post
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Gerencie todos os posts do seu blog.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="6" className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : posts.length === 0 ? (
                  <TableRow><TableCell colSpan="6" className="h-24 text-center">Nenhum post encontrado.</TableCell></TableRow>
                ) : (
                  posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.author_name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(post.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? 'success' : 'secondary'}>
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                       <TableCell>{post.view_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditor(post)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublish(post)}>
                                {post.is_published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                {post.is_published ? 'Despublicar' : 'Publicar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}><Globe className="mr-2 h-4 w-4" /> Ver Post</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => confirmDeletePost(post)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o post "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlog;