import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TestimonialCard = ({ item, styles }) => (
    <div className="flex flex-col h-full items-center text-center p-6 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
        <Avatar className="w-20 h-20 mb-4 border-2 border-primary/50">
            <AvatarImage src={item.avatarUrl} alt={item.name} />
            <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-lg italic text-foreground/80 mb-4 flex-grow">"{item.text}"</p>
        <p className="font-bold text-foreground" style={{color: styles.textColor}}>{item.name}</p>
        <p className="text-sm text-muted-foreground" style={{color: styles.textColorMuted}}>{item.role}</p>
    </div>
);

const TestimonialQuote = ({ item, styles }) => (
    <div className="relative text-center p-4">
        <Quote className="w-16 h-16 text-primary/20 absolute -top-2 left-1/2 -translate-x-1/2" />
        <p className="text-2xl italic text-foreground mb-6 pt-8" style={{color: styles.textColor}} >"{item.text}"</p>
        <div className="flex items-center justify-center gap-4">
            <Avatar>
                <AvatarImage src={item.avatarUrl} alt={item.name} />
                <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold text-foreground" style={{color: styles.textColor}}>{item.name}</p>
                <p className="text-sm text-muted-foreground" style={{color: styles.textColorMuted}}>{item.role}</p>
            </div>
        </div>
    </div>
);


const TestimonialBlock = ({ content, styles }) => {
    const { items = [], layout = 'slider' } = content;
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };
    
    if (!items || items.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Adicione depoimentos no painel de edição.</div>;
    }
    
    const currentItem = items[currentIndex];
    
    const renderContent = () => {
        switch (layout) {
            case 'card':
                return <TestimonialCard item={items[0]} styles={styles} />;
            case 'quote':
                return <TestimonialQuote item={items[0]} styles={styles} />;
            case 'grid':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 w-full h-full">
                        {items.map(item => <TestimonialCard key={item.id} item={item} styles={styles} />)}
                    </div>
                );
            case 'slider':
            default:
                return (
                     <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
                        <AnimatePresence initial={false} custom={currentIndex}>
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-2xl"
                            >
                                <TestimonialCard item={currentItem} styles={styles} />
                            </motion.div>
                        </AnimatePresence>
                        {items.length > 1 && (
                            <>
                                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80" onClick={handlePrev}><ChevronLeft/></Button>
                                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80" onClick={handleNext}><ChevronRight/></Button>
                            </>
                        )}
                    </div>
                );
        }
    };

    return <div className="w-full h-full" style={{...styles}}>{renderContent()}</div>
};

export default TestimonialBlock;