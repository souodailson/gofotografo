import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '@/components/FullScreenLoader';
import BlockRenderer from '@/pages/proposals/editor/BlockRenderer';
import { fontMap } from './proposalConstants';
import { getResponsiveBlockProps } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const PublicProposalPage = () => {
    const { proposalId } = useParams();
    const [proposal, setProposal] = useState(null);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('desktop');
    const { toast } = useToast();
    const { addWorkflowCard } = useData();

    useEffect(() => {
        const fetchProposal = async () => {
            setLoading(true);
            const { data, error: proposalError } = await supabase
                .from('propostas')
                .select('*')
                .eq('id', proposalId)
                .eq('is_published', true)
                .single();

            if (proposalError || !data) {
                setError('Proposta não encontrada ou não está publicada.');
                setLoading(false);
                return;
            }

            const fullProposal = {
                ...data,
                ...(data.dados_json || {}),
                layouts: data.layouts || { desktop: {}, tablet: {}, mobile: {} },
            };
            delete fullProposal.dados_json;
            setProposal(fullProposal);
            
            if (fullProposal.client_id) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('name')
                    .eq('id', fullProposal.client_id)
                    .single();
                
                if (!clientError) {
                    setClient(clientData);
                }
            }
        };

        fetchProposal();
    }, [proposalId]);

    useEffect(() => {
        if (!proposal) return;

        const fontImport = proposal.theme?.fontFamily?.import;
        if (fontImport) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontImport}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        const updateViewMode = () => {
            const width = window.innerWidth;
            if (width < 768) setViewMode('mobile');
            else if (width < 1024) setViewMode('tablet');
            else setViewMode('desktop');
        };

        window.addEventListener('resize', updateViewMode);
        updateViewMode();

        setLoading(false);

        return () => {
            window.removeEventListener('resize', updateViewMode);
        };

    }, [proposal]);

    const handleAcceptProposal = async () => {
        if (!proposal || !proposal.client_id) {
            toast({ title: 'Ação Inválida', description: 'Esta proposta não está vinculada a um cliente.', variant: 'destructive' });
            return;
        }

        try {
            await addWorkflowCard({
                title: `LEAD (Proposta Aceita): ${client?.name || 'Cliente'}`,
                client_id: proposal.client_id,
                status: 'novo-lead',
                value: 0,
                description: `Cliente aceitou a proposta "${proposal.nome_da_proposta}". Entrar em contato para os próximos passos.`,
                user_id: proposal.user_id,
                tags: ['Proposta Aceita', 'LEAD'],
            });

            toast({
                title: 'Proposta Aceita!',
                description: 'O fotógrafo foi notificado e entrará em contato em breve. Obrigado!',
                duration: 8000
            });
        } catch(err) {
            toast({ title: 'Erro ao aceitar', description: 'Não foi possível notificar o fotógrafo. Por favor, tente novamente.', variant: 'destructive' });
        }
    };
    
    if (loading) return <FullScreenLoader />;
    if (error) return <div className="flex items-center justify-center h-screen bg-gray-100 text-red-500">{error}</div>;

    const theme = proposal.theme || {};
    const font = fontMap[theme.fontFamily?.key] || fontMap.playfair_lato;
    
    const globalStyles = `
        body {
            background-color: ${theme.backgroundColor || '#FFFFFF'};
        }
        .public-proposal-body {
            font-family: '${font.body}', sans-serif;
            color: ${theme.textColor || '#333'};
        }
        .public-proposal-body .canvas-h1, .public-proposal-body .canvas-h2, .public-proposal-body .canvas-h3 {
            font-family: '${font.heading}', serif;
            color: ${theme.headingColor || '#111'};
        }
        .public-proposal-body .canvas-p {
            font-family: '${font.body}', sans-serif;
            color: ${theme.textColor || '#333'};
        }
        .public-proposal-body .cta-block-override button {
           background-color: ${theme.accentColor} !important;
        }
    `;

    const processContent = (originalContent) => {
        if (typeof originalContent !== 'string') return originalContent;
        let processedContent = originalContent;
        if (client?.name) {
             processedContent = processedContent.replace(/{{CLIENT_NAME}}/gi, client.name);
        }
        return processedContent;
    };


    return (
        <div className="public-proposal-body">
            <style>{globalStyles}</style>
            {proposal.sections.map(section => {
                const responsiveSectionProps = getResponsiveBlockProps({ layouts: section.layouts, height: section.height }, viewMode);
                const sectionHeight = responsiveSectionProps.height || section.height;

                const sectionStyles = {
                    ...section.styles,
                    position: 'relative',
                    width: '100%',
                    minHeight: `${sectionHeight}px`,
                    backgroundColor: section.styles?.backgroundColor || 'transparent',
                    backgroundImage: section.styles?.backgroundImage ? `url(${section.styles.backgroundImage})` : 'none',
                    backgroundSize: section.styles?.backgroundSize || 'cover',
                    backgroundPosition: section.styles?.backgroundPosition || 'center',
                    backgroundRepeat: section.styles?.backgroundRepeat || 'no-repeat',
                };
                return (
                    <section key={section.id} style={sectionStyles}>
                        <div className="relative" style={{ height: `${sectionHeight}px` }}>
                            {(proposal.blocksBySection[section.id] || []).map(block => {
                                const { visible, position, size } = getResponsiveBlockProps(block, viewMode);
                                if (visible === false) return null;

                                const processedBlock = {
                                    ...block,
                                    content: {
                                        ...block.content,
                                        text: processContent(block.content?.text),
                                        title: processContent(block.content?.title),
                                        subtitle: processContent(block.content?.subtitle),
                                    },
                                    handlers: {
                                        onAccept: handleAcceptProposal,
                                    }
                                };

                                return (
                                    <div
                                        key={block.id}
                                        style={{
                                            position: 'absolute',
                                            ...position,
                                            ...size,
                                            zIndex: block.styles?.zIndex || 'auto',
                                        }}
                                        className="block-container"
                                    >
                                        <BlockRenderer block={processedBlock} viewMode={viewMode} />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default PublicProposalPage;