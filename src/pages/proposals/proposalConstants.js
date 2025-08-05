import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Type, Image, Video, Divide, ArrowRightLeft, MousePointerClick, Star, HelpCircle, Share2, Package as PackageIcon, Heading1, Heading2, Pilcrow, Square, Circle, Minus as LineIcon, Box, FileText } from 'lucide-react';

export const initialProposalData = {
  nome_da_proposta: 'Nova Proposta',
  client_id: null,
  sections: [{ id: uuidv4(), name: 'Seção 1' }],
  blocksBySection: {},
  layouts: {},
  theme: {
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    headingColor: '#111111',
    accentColor: '#3B82F6',
    fontFamily: {
      key: 'playfair_lato',
      heading: 'Playfair Display',
      body: 'Lato',
      import: 'Playfair+Display:wght@700&family=Lato:wght@400;700'
    },
  },
};

export const textBlockOptions = [
  {
    type: 'text',
    label: 'Adicionar um título',
    icon: <Heading1 size={18} />,
    content: { text: 'Título', level: 'h1' },
    styles: { fontSize: '48px', fontWeight: 'bold', backgroundColor: 'transparent', backgroundOpacity: 0 }
  },
  {
    type: 'text',
    label: 'Adicionar um subtítulo',
    icon: <Heading2 size={18} />,
    content: { text: 'Subtítulo', level: 'h2' },
    styles: { fontSize: '32px', fontWeight: 'bold', backgroundColor: 'transparent', backgroundOpacity: 0 }
  },
  {
    type: 'text',
    label: 'Adicionar um parágrafo',
    icon: <Pilcrow size={18} />,
    content: { text: 'Clique para adicionar seu texto. Use este espaço para detalhar sua oferta, contar sua história ou apresentar informações importantes.', level: 'p' },
    styles: { fontSize: '16px', backgroundColor: 'transparent', backgroundOpacity: 0 }
  },
];

export const availableBlocks = [
  {
    type: 'image',
    label: 'Imagem',
    icon: <Image size={18} />,
    content: { src: '', alt: 'Placeholder de imagem' },
    styles: { paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', width: '100%', borderRadius: '0px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
   {
    type: 'pdf',
    label: 'PDF',
    icon: <FileText size={18} />,
    content: { src: '' },
    styles: { paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', width: '100%', height: '600px', backgroundColor: 'transparent', backgroundOpacity: 0 }
  },
   {
    type: 'packages',
    label: 'Pacotes',
    icon: <PackageIcon size={18} />,
    content: { packageIds: [], layout: 'grid', title: 'Nossos Pacotes' },
    styles: { paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'video',
    label: 'Vídeo',
    icon: <Video size={18} />,
    content: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    styles: { paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'testimonial',
    label: 'Depoimento',
    icon: <Star size={18} />,
    content: {
      items: [{ id: uuidv4(), name: 'Cliente Satisfeito', role: 'Casamento dos Sonhos', text: 'Uma experiência incrível do início ao fim. As fotos ficaram maravilhosas!', avatarUrl: '' }],
      layout: 'card',
    },
    styles: { paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: <HelpCircle size={18} />,
    content: {
      items: [
        { id: uuidv4(), question: 'Qual o prazo de entrega?', answer: 'O prazo de entrega das fotos editadas é de 30 dias úteis após a data do evento.' },
        { id: uuidv4(), question: 'Você fotografa em outras cidades?', answer: 'Sim, atendo em todo o Brasil. Custos de deslocamento e hospedagem são combinados à parte.' },
      ]
    },
    styles: { paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'cta',
    label: 'Chamada à Ação',
    icon: <MousePointerClick size={18} />,
    content: {
      title: 'Gostou da proposta?',
      subtitle: 'Vamos dar o próximo passo para registrar seus momentos inesquecíveis.',
      buttons: [
        { id: uuidv4(), text: 'Aceitar Proposta', actionType: 'accept', link: '' },
        { id: uuidv4(), text: 'Falar no WhatsApp', actionType: 'whatsapp', link: '5511999998888' },
      ],
    },
    styles: { paddingTop: '50px', paddingBottom: '50px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'transparent', backgroundOpacity: 0, color: '#333333', textAlign: 'center' },
  },
  {
    type: 'social',
    label: 'Redes Sociais',
    icon: <Share2 size={18} />,
    content: {
        items: [
            { id: uuidv4(), platform: 'instagram', url: 'https://instagram.com' },
            { id: uuidv4(), platform: 'facebook', url: 'https://facebook.com' },
            { id: uuidv4(), platform: 'site', url: 'https://seusite.com' },
        ]
    },
    styles: { paddingTop: '20px', paddingBottom: '20px', iconColor: '#333333', alignment: 'center', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'button',
    label: 'Botão',
    icon: <MousePointerClick size={18} />,
    content: { text: 'Clique aqui', href: '#' },
    styles: { paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', textAlign: 'center', backgroundColor: 'transparent', backgroundOpacity: 0, color: '#3B82F6', borderWidth: '0px' },
  },
  {
    type: 'divider',
    label: 'Divisor',
    icon: <Divide size={18} />,
    content: {},
    styles: { paddingTop: '10px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'spacer',
    label: 'Espaçador',
    icon: <ArrowRightLeft size={18} />,
    content: { height: 40 },
    styles: { backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
];

export const elementBlocks = [
  {
    type: 'box',
    label: 'Caixa',
    icon: <Box size={18} />,
    content: {},
    styles: { backgroundColor: 'transparent', backgroundOpacity: 0, borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e0e0e0' },
  },
  {
    type: 'shape',
    label: 'Retângulo',
    icon: <Square size={18} />,
    content: { shapeType: 'rectangle' },
    styles: { backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'shape',
    label: 'Círculo',
    icon: <Circle size={18} />,
    content: { shapeType: 'circle' },
    styles: { backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'shape',
    label: 'Linha',
    icon: <LineIcon size={18} />,
    content: { shapeType: 'line' },
    styles: { borderColor: '#000000', borderWidth: '2px', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
  {
    type: 'icon',
    label: 'Ícone',
    icon: <Star size={18} />,
    content: { iconName: 'Star' },
    styles: { color: '#000000', backgroundColor: 'transparent', backgroundOpacity: 0 },
  },
];

export const fontOptions = [
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Lato', label: 'Lato' },
    { value: 'DM Serif Display', label: 'DM Serif Display' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Prata', label: 'Prata' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'EB Garamond', label: 'EB Garamond' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Libre Baskerville', label: 'Libre Baskerville' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Abril Fatface', label: 'Abril Fatface' },
    { value: 'Karla', label: 'Karla' },
    { value: 'Marcellus', label: 'Marcellus' },
    { value: 'Noto Sans', label: 'Noto Sans' },
    { value: 'Josefin Slab', label: 'Josefin Slab' },
    { value: 'Work Sans', label: 'Work Sans' },
    { value: 'Cinzel', label: 'Cinzel' },
    { value: 'Quicksand', label: 'Quicksand' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
];

export const fontMap = {
    playfair_lato: { heading: 'Playfair Display', body: 'Lato', import: 'Playfair+Display:wght@700&family=Lato:wght@400;700' },
    dmserif_sourcesans: { heading: 'DM Serif Display', body: 'Source Sans Pro', import: 'DM+Serif+Display&family=Source+Sans+Pro:wght@400;700' },
    cormorant_opensans: { heading: 'Cormorant Garamond', body: 'Open Sans', import: 'Cormorant+Garamond:wght@700&family=Open+Sans:wght@400;700' },
    prata_nunito: { heading: 'Prata', body: 'Nunito', import: 'Prata&family=Nunito:wght@400;700' },
    ebgaramond_raleway: { heading: 'EB Garamond', body: 'Raleway', import: 'EB+Garamond:wght@700&family=Raleway:wght@400;700' },
    libre_inter: { heading: 'Libre Baskerville', body: 'Inter', import: 'Libre+Baskerville:wght@700&family=Inter:wght@400;700' },
    abril_karla: { heading: 'Abril Fatface', body: 'Karla', import: 'Abril+Fatface&family=Karla:wght@400;700' },
    marcellus_notosans: { heading: 'Marcellus', body: 'Noto Sans', import: 'Marcellus&family=Noto+Sans:wght@400;700' },
    josefinslab_worksans: { heading: 'Josefin Slab', body: 'Work Sans', import: 'Josefin+Slab:wght@700&family=Work+Sans:wght@400;700' },
    cinzel_quicksand: { heading: 'Cinzel', body: 'Quicksand', import: 'Cinzel:wght@700&family=Quicksand:wght@400;700' },
};