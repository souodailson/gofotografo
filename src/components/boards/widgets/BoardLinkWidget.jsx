import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trello, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const defaultBoardBackground = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//fundo%20liquid%20gofotografo%20wihtout%20grain.jpg";

const BoardLinkWidget = ({ widget, isEditing, onDelete }) => {
  const navigate = useNavigate();
  const board = widget.quadro;

  const handleClick = () => {
    if (!isEditing && board?.id) {
      navigate(`/quadros/${board.id}`);
    }
  };

  const backgroundImage = board?.imagem_fundo || defaultBoardBackground;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full rounded-lg shadow-lg overflow-hidden relative group cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full p-4 text-white">
        <div className="flex items-start justify-between">
          <Trello className="w-6 h-6 opacity-80" />
          {isEditing && (
            <div className="flex items-center gap-1">
              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="drag-handle p-1.5 bg-card/80 rounded-full cursor-grab active:cursor-grabbing">
                <GripVertical size={16} className="text-foreground" />
              </div>
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg break-words">{board?.nome_quadro || 'Quadro Removido'}</h3>
      </div>
    </motion.div>
  );
};

export default BoardLinkWidget;