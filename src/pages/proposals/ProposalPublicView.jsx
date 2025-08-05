import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '@/components/FullScreenLoader';
import EditorCanvas from './editor/EditorCanvas';

const ProposalPublicView = () => {
  const { slug } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!slug) {
        setError('Slug da proposta não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('propostas')
          .select('dados_json, state')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Handle both the legacy `state` field and the newer `dados_json`
        // format.  Proposals saved after August 2025 use `dados_json`.
        if (data) {
          if (data.dados_json) {
            setProposal(data.dados_json);
          } else if (data.state) {
            setProposal(data.state);
          } else {
            setError('Proposta não encontrada ou não está publicada.');
          }
        } else {
          setError('Proposta não encontrada ou não está publicada.');
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
        setError('Ocorreu um erro ao carregar a proposta.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [slug]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-gray-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-muted/40 min-h-screen flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <EditorCanvas
          ref={canvasRef}
          sections={proposal.sections}
          blocksBySection={proposal.blocksBySection}
          globalStyles={proposal.theme}
          viewMode="desktop" // Public view is always desktop-like, but responsive
          // Pass dummy functions for props that expect them
          addBlock={() => {}}
          setSelectedBlock={() => {}}
          updateBlock={() => {}}
          setProposal={() => {}}
          onContextMenu={() => {}}
          setSnapLines={() => {}}
          showGrid={false}
        />
      </div>
    </div>
  );
};

export default ProposalPublicView;
