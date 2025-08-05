import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, MessageSquare } from 'lucide-react';

const CtaBlock = ({ content, styles, handlers }) => {
    const { title, subtitle, buttons = [] } = content;

    const getIcon = (actionType) => {
        switch(actionType) {
            case 'accept': return <Check className="w-4 h-4 mr-2" />;
            case 'whatsapp': return <MessageSquare className="w-4 h-4 mr-2" />;
            case 'link':
            default: return <ArrowRight className="w-4 h-4 mr-2" />;
        }
    }
    
    const handleButtonClick = (button) => {
        if (button.actionType === 'accept' && handlers?.onAccept) {
            handlers.onAccept();
        } else if (button.actionType === 'link' && button.link) {
            window.open(button.link, '_blank');
        } else if (button.actionType === 'whatsapp' && button.link) {
            const phone = button.link.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    return (
        <div style={styles} className="w-full text-center cta-block-override">
            <h2 className="text-3xl font-bold mb-2 canvas-h2" style={{color: styles.color}}>{title}</h2>
            <p className="text-lg opacity-80 mb-6 canvas-p" style={{color: styles.color}}>{subtitle}</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                {buttons.map(button => (
                    <Button 
                        key={button.id}
                        size="lg"
                        style={{backgroundColor: styles.accentColor, color: '#FFFFFF' }}
                        className="shadow-lg transform hover:scale-105 transition-transform"
                        onClick={() => handleButtonClick(button)}
                    >
                        {getIcon(button.actionType)}
                        {button.text}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default CtaBlock;