import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Palette, CaseSensitive, Minus, Plus, Text, Sparkles, Move } from 'lucide-react';
import { fontOptions } from '../proposalConstants';
import { HexColorPicker } from 'react-colorful';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TextFormattingToolbar = ({ selectedBlock, updateBlock }) => {
  const { toast } = useToast();

  if (!selectedBlock || selectedBlock.type !== 'text') return null;

  const styles = selectedBlock.styles || {};

  const handleStyleChange = (property, value) => {
    updateBlock(selectedBlock.id, {
      styles: {
        ...selectedBlock.styles,
        [property]: value
      }
    });
  };

  const handleFontSizeChange = (amount) => {
    const currentSize = parseInt(styles.fontSize) || 16;
    handleStyleChange('fontSize', `${Math.max(1, currentSize + amount)}px`);
  };

  const toggleStyle = (property, activeValue, inactiveValue) => {
    const isActive = styles[property] === activeValue;
    handleStyleChange(property, isActive ? inactiveValue : activeValue);
  };
  
  const toggleTextDecoration = (decoration) => {
    const currentDecorations = (styles.textDecoration || '').split(' ').filter(d => d);
    const hasDecoration = currentDecorations.includes(decoration);
    const newDecorations = hasDecoration
      ? currentDecorations.filter(d => d !== decoration)
      : [...currentDecorations, decoration];
    handleStyleChange('textDecoration', newDecorations.join(' ').trim());
  };
  
  const showToast = () => {
    toast({
        title: "🚧 Funcionalidade em desenvolvimento",
        description: "Esta opção estará disponível em breve!",
    });
  };

  return (
    <TooltipProvider>
    <div className="bg-background rounded-lg shadow-md p-1 flex items-center gap-1 border">
      <Select value={styles.fontFamily || 'Inter'} onValueChange={v => handleStyleChange('fontFamily', v)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontOptions.map(opt => <SelectItem key={opt.value} value={opt.value} style={{fontFamily: opt.label}}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFontSizeChange(-1)}><Minus size={14}/></Button>
        <Input type="number" value={parseInt(styles.fontSize) || 16} onChange={e => handleStyleChange('fontSize', `${Math.max(1, parseInt(e.target.value) || 0)}px`)} className="w-12 h-8 text-center" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFontSizeChange(1)}><Plus size={14}/></Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Palette size={14} style={{color: styles.color || '#000000'}} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0">
          <HexColorPicker color={styles.color || '#333333'} onChange={c => handleStyleChange('color', c)} />
        </PopoverContent>
      </Popover>
      <div className="h-6 border-l mx-1"></div>
      <Button variant={styles.fontWeight === 'bold' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => toggleStyle('fontWeight', 'bold', 'normal')}><Bold size={14} /></Button>
      <Button variant={styles.fontStyle === 'italic' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => toggleStyle('fontStyle', 'italic', 'normal')}><Italic size={14} /></Button>
      <Button variant={styles.textDecoration?.includes('underline') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => toggleTextDecoration('underline')}><Underline size={14} /></Button>
      <Button variant={styles.textDecoration?.includes('line-through') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => toggleTextDecoration('line-through')}><Strikethrough size={14} /></Button>
      <div className="h-6 border-l mx-1"></div>
      <Button variant={styles.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleStyleChange('textAlign', 'left')}><AlignLeft size={14} /></Button>
      <Button variant={styles.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleStyleChange('textAlign', 'center')}><AlignCenter size={14} /></Button>
      <Button variant={styles.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleStyleChange('textAlign', 'right')}><AlignRight size={14} /></Button>
      <Button variant={styles.textAlign === 'justify' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleStyleChange('textAlign', 'justify')}><AlignJustify size={14} /></Button>
      <div className="h-6 border-l mx-1"></div>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={showToast}><List size={14} /></Button></TooltipTrigger>
        <TooltipContent><p>Lista com marcadores</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={showToast}><ListOrdered size={14} /></Button></TooltipTrigger>
        <TooltipContent><p>Lista numerada</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={showToast}><Text size={14} /></Button></TooltipTrigger>
        <TooltipContent><p>Espaçamento</p></TooltipContent>
      </Tooltip>
      <div className="h-6 border-l mx-1"></div>
       <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={showToast}><Sparkles size={14} /></Button></TooltipTrigger>
        <TooltipContent><p>Efeitos</p></TooltipContent>
      </Tooltip>
       <Tooltip>
        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={showToast}><Move size={14} /></Button></TooltipTrigger>
        <TooltipContent><p>Animar</p></TooltipContent>
      </Tooltip>
    </div>
    </TooltipProvider>
  );
};

export default TextFormattingToolbar;