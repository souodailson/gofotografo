import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';

const renderBlock = (block, index) => {
  switch (block.type) {
    case 'h1':
      return <h1 key={index} className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4 titulo-gradiente-animado">{block.content.text}</h1>;
    case 'h2':
      return <h2 key={index} className="text-3xl font-bold mt-8 mb-4">{block.content.text}</h2>;
    case 'p':
      return <p key={index} className="mb-4 leading-relaxed">{block.content.text}</p>;
    case 'img':
      return <img key={index} src={block.content.src} alt={block.content.alt || ''} className="my-6 rounded-lg shadow-md w-full object-cover" />;
    default:
      return null;
  }
};

const StandardTemplate = ({ page }) => {
  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4 titulo-gradiente-animado">
          {page.title}
        </h1>
        <div className="flex items-center justify-center text-sm text-muted-foreground space-x-4">
          <span className="flex items-center"><User className="w-4 h-4 mr-1.5" /> Equipe GO.</span>
          <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {format(new Date(page.updated_at), 'dd MMM, yyyy', { locale: ptBR })}</span>
        </div>
      </header>
      
      {page.cover_image_url && (
        <div className="mb-8">
          <img src={page.cover_image_url} alt={page.title} className="w-full rounded-lg shadow-lg aspect-video object-cover" />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none lg:prose-lg mx-auto">
        {Array.isArray(page.content) && page.content.map((block, index) => renderBlock(block, index))}
      </div>
    </article>
  );
};

export default StandardTemplate;