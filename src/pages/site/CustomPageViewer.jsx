import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '@/components/FullScreenLoader';
import { ArrowLeft } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import StandardTemplate from '@/components/page-templates/StandardTemplate';
import ContactTemplate from '@/components/page-templates/ContactTemplate';

const templateMap = {
  standard: StandardTemplate,
  contact: ContactTemplate,
};

const CustomPageViewer = ({ slug: staticSlug, isTutorial = false }) => {
  const { slug } = useParams();
  const effectiveSlug = staticSlug || slug;
  const { settings } = useData();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', effectiveSlug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        setError("Página não encontrada ou não está disponível.");
      } else {
        setPage(data);
      }
      setLoading(false);
    };

    if (effectiveSlug) {
      fetchPage();
    }
  }, [effectiveSlug]);

  const blogLogoUrl = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//favicon%20gofotografo.png";
  const displayLogo = settings?.logo || blogLogoUrl;
  const backLink = isTutorial ? '/tutoriais' : '/';
  const backLinkText = isTutorial ? 'Voltar para Tutoriais' : 'Voltar para o Início';

  if (loading) return <FullScreenLoader />;

  const TemplateComponent = templateMap[page?.template_name] || StandardTemplate;

  return (
    <div className="bg-background min-h-screen">
      <header className="py-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to={backLink} className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            {backLinkText}
          </Link>
          <Link to="/">
            <img src={displayLogo} alt="Logo" className="h-8" />
          </Link>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-destructive">Oops!</h2>
            <p className="text-muted-foreground mt-4">{error}</p>
          </div>
        ) : page && (
          <TemplateComponent page={page} />
        )}
      </main>
    </div>
  );
};

export default CustomPageViewer;