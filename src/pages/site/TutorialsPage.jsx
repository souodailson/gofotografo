import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Search } from 'lucide-react';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';

const TutorialsPage = () => {
  const { settings } = useData();
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('is_published', true)
        .eq('page_type', 'tutorial')
        .order('created_at', { ascending: false });

      if (error) {
        setError("Não foi possível carregar os tutoriais.");
      } else {
        setTutorials(data);
      }
      setLoading(false);
    };
    fetchTutorials();
  }, []);
  
  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutorial.seo_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const blogLogoUrl = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//favicon%20gofotografo.png";
  const displayLogo = settings?.logo || blogLogoUrl;

  if (loading) return <FullScreenLoader />;

  return (
    <div className="bg-background min-h-screen">
      <header className="relative py-20 md:py-32 text-center border-b overflow-hidden">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-md z-10"></div>
        <div className="container mx-auto px-4 relative z-20">
            <Link to="/" className="inline-block mb-8">
                <img src={displayLogo} alt="Logo" className="h-12 mx-auto" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold titulo-gradiente-animado mb-4">Central de Ajuda</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Fique por dentro com nossos tutoriais e domine a plataforma.</p>
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar tutoriais..."
                    className="w-full h-14 pl-12 pr-4 rounded-full text-lg shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        {error && <p className="text-center text-red-500">{error}</p>}
        {filteredTutorials.length === 0 && !error && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-muted-foreground">Nenhum tutorial encontrado.</h2>
            <p className="text-muted-foreground mt-2">Tente buscar por outros termos.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map(tutorial => (
            <Card key={tutorial.id} className="flex flex-col overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <Link to={`/tutoriais/${tutorial.slug}`} className="block">
                {tutorial.cover_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={tutorial.cover_image_url} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
              </Link>
              <CardHeader>
                <Link to={`/tutoriais/${tutorial.slug}`} className="block">
                  <CardTitle className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">{tutorial.title}</CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm">{tutorial.seo_description}</p>
              </CardContent>
              <CardFooter>
                <Link to={`/tutoriais/${tutorial.slug}`} className="flex items-center text-sm font-semibold text-primary hover:underline">
                  Ver tutorial <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TutorialsPage;