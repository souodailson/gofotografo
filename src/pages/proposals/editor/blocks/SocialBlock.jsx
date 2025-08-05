import React from 'react';
import { Instagram, Facebook, Link as LinkIcon, Youtube, Twitter, Linkedin, MessageSquare as WhatsApp, Image as Pinterest } from 'lucide-react';

const platformIcons = {
    instagram: <Instagram />,
    facebook: <Facebook />,
    twitter: <Twitter />,
    linkedin: <Linkedin />,
    whatsapp: <WhatsApp />,
    youtube: <Youtube />,
    pinterest: <Pinterest />,
    site: <LinkIcon />,
};

const SocialBlock = ({ content, styles }) => {
    const { items = [] } = content;
    const { iconColor = '#333333', alignment = 'center' } = styles;

    if (!items || items.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Adicione redes sociais no painel de edição.</div>;
    }

    const alignmentClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    };

    const getFullUrl = (platform, url) => {
        if (platform === 'whatsapp') {
            const phone = url.replace(/\D/g, '');
            return `https://wa.me/${phone}`;
        }
        return url.startsWith('http') ? url : `https://${url}`;
    };

    return (
        <div className={`flex gap-4 ${alignmentClasses[alignment] || 'justify-center'}`}>
            {items.map(item => (
                <a
                    key={item.id}
                    href={getFullUrl(item.platform, item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: iconColor }}
                    className="transform hover:scale-110 transition-transform"
                >
                    {platformIcons[item.platform] || <LinkIcon />}
                </a>
            ))}
        </div>
    );
};

export default SocialBlock;