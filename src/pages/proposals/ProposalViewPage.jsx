import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '@/components/FullScreenLoader';
import EditorCanvas from './editor/EditorCanvas';

/**
 * Displays a read‑only preview of a proposal by its numeric ID.  This page
 * is similar to ProposalPublicView but looks up the record by `id` rather
 * than a slug.  Only published proposals will be shown; unpublished
 * proposals will result in an error message.
 */
const ProposalViewPage = () => {
  const { proposalId } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) {
        setError('ID da proposta não encontrado.');
        setLoading(false);
        return;
      }
      try {
        const { data, error: fetchError } = await supabase
          .from('propostas')
          .select('dados_json, state')
          .eq('id', proposalId)
          .eq('is_published', true)
          .maybeSingle();
        if (fetchError) throw fetchError;
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
        console.error('Error fetching proposal by id:', err);
        setError('Ocorreu um erro ao carregar a proposta.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [proposalId]);

  if (loading) {
    return <FullScreenLoader />;
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Erro</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }
  if (!proposal) {
    return <FullScreenLoader />;
  }
  return (
    <div className="bg-muted/40 dark:bg-muted/50 min-h-screen flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <EditorCanvas
          ref={canvasRef}
          sections={proposal.sections}
          blocksBySection={proposal.blocksBySection}
          globalStyles={proposal.theme}
          viewMode="desktop"
          // Provide no‑ops for editor callbacks since this is read‑only
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

export default ProposalViewPage;
