import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FaqItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-border/50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-4 text-left"
            >
                <span className="font-semibold text-foreground">{item.question}</span>
                <ChevronDown className={cn("transform transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-muted-foreground">{item.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FaqBlock = ({ content, styles }) => {
    const { items = [] } = content;
    
    if (!items || items.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Adicione perguntas e respostas no painel de edição.</div>;
    }

    return (
        <div className="w-full">
            {items.map((item) => (
                <FaqItem key={item.id} item={item} />
            ))}
        </div>
    );
};

export default FaqBlock;