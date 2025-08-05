import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '@/components/FullScreenLoader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { User, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const BlogPostPage = () => {
    const { slug } = useParams();
    const { settings } = useData();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('is_published', true)
                .single();

            if (error || !data) {
                console.error("Erro ao buscar post:", error);
                setError("Post não encontrado ou não está disponível.");
            } else {
                setPost(data);
                const { error: viewError } = await supabase.rpc('increment_view_count', { post_slug: slug });
                if(viewError) console.error("Error incrementing view count:", viewError);
            }
            setLoading(false);
        };
        fetchPost();
    }, [slug]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copiado!",
            description: "O link do post foi copiado para sua área de transferência.",
        });
    };
    
    const blogLogoUrl = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//favicon%20gofotografo.png";
    const displayLogo = settings?.logo || blogLogoUrl;


    if (loading) return <FullScreenLoader />;

    return (
        <div className="bg-background min-h-screen">
             <header className="py-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/blog" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para o Blog
                    </Link>
                     <Link to="/">
                         <img src={displayLogo} alt="Logo" className="h-8" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                {error ? (
                     <div className="text-center py-20">
                        <h2 className="text-4xl font-bold text-destructive">Oops!</h2>
                        <p className="text-muted-foreground mt-4">{error}</p>
                        <Link to="/blog">
                           <Button className="mt-8">Ver outros posts</Button>
                        </Link>
                    </div>
                ) : post && (
                    <article className="max-w-3xl mx-auto">
                        <header className="mb-8 text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4 titulo-gradiente-animado">
                                {post.title}
                            </h1>
                            <div className="flex items-center justify-center text-sm text-muted-foreground space-x-4">
                               <span className="flex items-center"><User className="w-4 h-4 mr-1.5" /> {post.author_name || 'Equipe GO.'}</span>
                               <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {post.published_at ? format(new Date(post.published_at), 'dd MMM, yyyy', { locale: ptBR }) : ''}</span>
                            </div>
                        </header>
                        
                        <div className="mb-8">
                             <img src={post.cover_image_url} alt={post.title} className="w-full rounded-lg shadow-lg aspect-video object-cover" />
                        </div>

                        <div className="prose dark:prose-invert max-w-none lg:prose-lg mx-auto">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
};

export default BlogPostPage;