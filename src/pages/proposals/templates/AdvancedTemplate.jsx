import React from 'react';
import { fontMap } from '@/pages/proposals/proposalConstants';
import BlockRenderer from '@/pages/proposals/editor/BlockRenderer';

const AdvancedTemplate = ({ data }) => {
  if (!data) {
    return <div className="p-8 text-center text-red-500">Dados da proposta não encontrados.</div>;
  }

  const { theme = {}, blocks = [], nome_da_proposta, client } = data;
  const variables = {
    nome_cliente: client?.name || 'Cliente',
    data_proposta: new Date().toLocaleDateString('pt-BR'),
  };

  const selectedFontPair = fontMap[theme.fontFamily?.key] || fontMap.playfair_lato;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=${selectedFontPair.import.replace(/ /g, '+')}&display=swap');
    
    .adv-proposal-body { 
      font-family: '${selectedFontPair.body}', sans-serif; 
      color: ${theme.textColor || '#333333'}; 
      background-color: ${theme.backgroundColor || '#ffffff'}; 
    }
    .adv-proposal-container { 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    .canvas-h1, .canvas-h2, .canvas-h3 { 
      font-family: '${selectedFontPair.heading}', serif; 
      color: ${theme.headingColor || '#111111'};
    }
  `;

  const processedProposalTitle = nome_da_proposta?.replace(/{{(.*?)}}/g, (match, key) => variables[key.trim()] || match) || 'Proposta Fotográfica';

  return (
    <div className="adv-proposal-body">
      <style>{styles}</style>
      <div className="adv-proposal-container">
        {blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default AdvancedTemplate;