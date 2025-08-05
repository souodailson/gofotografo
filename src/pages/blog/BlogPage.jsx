import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useData } from '@/contexts/DataContext';

const BlogPage = () => {
    const { settings } = useData();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar posts:", error);
                setError("Não foi possível carregar os posts. Tente novamente mais tarde.");
            } else {
                setPosts(data);
            }
            setLoading(false);
        };
        fetchPosts();
    }, []);
    
    const blogLogoUrl = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//favicon%20gofotografo.png";
    const displayLogo = settings?.logo || blogLogoUrl;

    if (loading) return <FullScreenLoader />;

    return (
        <div className="bg-background min-h-screen">
            <header className="py-6 border-b">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/">
                         <img src={displayLogo} alt="Logo" className="h-8" />
                    </Link>
                    <h1 className="text-3xl font-bold titulo-gradiente-animado">Nosso Blog</h1>
                    <Link to="/login" className="text-sm font-medium hover:text-primary">Acessar Plataforma</Link>
                </div>
            </header>
            <main className="container mx-auto px-4 py-12">
                {error && <p className="text-center text-red-500">{error}</p>}
                {posts.length === 0 && !error && (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-muted-foreground">Nenhuma publicação ainda.</h2>
                        <p className="text-muted-foreground mt-2">Volte em breve para conferir nosso conteúdo!</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <Card key={post.id} className="flex flex-col overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                           <Link to={`/blog/${post.slug}`} className="block">
                                <div className="aspect-video overflow-hidden">
                                     <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                            </Link>
                            <CardHeader>
                               <Link to={`/blog/${post.slug}`} className="block">
                                  <CardTitle className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</CardTitle>
                               </Link>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground line-clamp-3 text-sm">{post.seo_description}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start space-y-4">
                                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                    <span className="flex items-center"><User className="w-3 h-3 mr-1.5" /> {post.author_name || 'Equipe GO.'}</span>
                                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1.5" /> {post.published_at ? format(new Date(post.published_at), 'dd MMM, yyyy', { locale: ptBR }) : 'Não publicado'}</span>
                                </div>
                                <Link to={`/blog/${post.slug}`} className="flex items-center text-sm font-semibold text-primary hover:underline">
                                    Ler mais <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default BlogPage;