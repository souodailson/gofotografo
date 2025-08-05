import React from 'react';
import { Button } from '@/components/ui/button';
import TestimonialBlock from './blocks/TestimonialBlock';
import FaqBlock from './blocks/FaqBlock';
import CtaBlock from './blocks/CtaBlock';
import SocialBlock from './blocks/SocialBlock';
import PackagesBlock from './blocks/PackagesBlock';
import PdfBlock from './blocks/PdfBlock';
import { motion } from 'framer-motion';
import { Camera, Square, Circle, Minus as LineIcon } from 'lucide-react';
import { getResponsiveBlockProps } from '@/lib/utils';
import { hexToRgba } from '@/lib/utils/colorUtils';  // Assuming hexToRgba is defined in colorUtils if needed

const BlockRenderer = ({ block, isSelected, updateBlock, viewMode = 'desktop', onPdfHeightChange }) => {
  const { type, content, animation = {} } = block;
  const { styles } = getResponsiveBlockProps(block, viewMode);

  // Determine style props for the container (e.g., background color, etc.)
  const styleProps = {
    ...styles,
    position: 'relative',
  };

  // Determine animation props for motion.div if an animation is specified
  const animationProps = {};
  if (animation.type) {
    // Example: fade-in animation
    if (animation.type === 'fade') {
      animationProps.initial = { opacity: 0 };
      animationProps.animate = { opacity: 1 };
      animationProps.transition = { duration: animation.duration || 0.5 };
    }
    // You can add more animation types here if needed
  }

  return (
    <motion.div style={styleProps} {...animationProps}>
      {
        (() => {
          switch (type) {
            case 'text':
              return <p style={{ color: styles.color, textAlign: styles.textAlign }}>{content.text}</p>;
            case 'heading':
              if (content.level === 2) {
                return <h2 style={{ color: styles.color, textAlign: styles.textAlign }}>{content.text}</h2>;
              } else if (content.level === 3) {
                return <h3 style={{ color: styles.color, textAlign: styles.textAlign }}>{content.text}</h3>;
              } else {
                return <h1 style={{ color: styles.color, textAlign: styles.textAlign }}>{content.text}</h1>;
              }
            case 'divider':
              return <hr style={{ borderColor: styles.color, borderWidth: styles.thickness, width: '100%' }} />;
            case 'spacer':
              return <div style={{ height: `${content.height}px`, width: '100%' }}></div>;
            case 'cover':
              return <h1 className="canvas-h1" style={{ color: styles.color, textAlign: styles.textAlign }}>{content.title}</h1>;
            case 'testimonial':
              return <TestimonialBlock content={content} styles={styles} />;
            case 'faq':
              return <FaqBlock content={content} styles={styles} />;
            case 'cta':
              return <CtaBlock content={content} styles={styles} />;
            case 'social':
              return <SocialBlock content={content} styles={styles} />;
            case 'packages':
              return <PackagesBlock content={content} styles={styles} />;
            case 'pdf':
              return <PdfBlock block={block} viewMode={viewMode} onHeightChange={onPdfHeightChange} />;
            case 'image':
              return content.src ? (
                <img src={content.src} alt={content.alt} style={{ width: '100%' }} />
              ) : (
                <div className="border border-dashed border-gray-400 p-4 text-center">
                  <Camera size={48} />
                  <p className="mt-2 text-sm">Arraste ou clique para enviar uma imagem.</p>
                </div>
              );
            case 'button':
              return (
                <div style={{ textAlign: styles.textAlign }}>
                  <Button style={{ backgroundColor: styles.backgroundColor, color: styles.color }}>
                    {content.text}
                  </Button>
                </div>
              );
            case 'list':
              if (content.style === 'ordered') {
                return (
                  <ol style={{ color: styles.color }}>
                    {content.items.map((item, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {item}
                      </li>
                    ))}
                  </ol>
                );
              } else {
                // Unordered list
                return (
                  <ul style={{ color: styles.color }}>
                    {content.items.map((item, index) => (
                      <li key={index} style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        {content.listIcon === 'square' ? <Square size={16} style={{ marginRight: '8px' }} /> :
                         content.listIcon === 'circle' ? <Circle size={16} style={{ marginRight: '8px' }} /> :
                         <LineIcon size={16} style={{ marginRight: '8px' }} />}
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
            case 'box':
              return (
                <div style={{ width: '100%', height: content.height || '100px', backgroundColor: styles.backgroundColor || '#f0f0f0' }}>
                  {/* A simple colored box block */}
                </div>
              );
            default:
              return <div>Bloco desconhecido: {type}</div>;
          }
        })()
      }
    </motion.div>
  );
};

export default BlockRenderer;
