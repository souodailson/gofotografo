import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Replace, Brush, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const ImageFormattingToolbar = ({ selectedBlock, updateBlock, onUploadComplete, proposalId, user }) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);

  if (!selectedBlock || selectedBlock.type !== 'image') return null;
  
  const imageFilters = {
    brightness: selectedBlock.styles?.brightness || 100,
    contrast: selectedBlock.styles?.contrast || 100,
    saturate: selectedBlock.styles?.saturate || 100,
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...imageFilters, [filterName]: value };
    const filterString = `brightness(${newFilters.brightness}%) contrast(${newFilters.contrast}%) saturate(${newFilters.saturate}%)`;
    updateBlock(selectedBlock.id, {
      styles: {
        ...selectedBlock.styles,
        filter: filterString,
        brightness: newFilters.brightness,
        contrast: newFilters.contrast,
        saturate: newFilters.saturate,
      }
    });
  };

  const handleFlip = (direction) => {
    const currentTransform = selectedBlock.styles?.transform || '';
    let newTransform;
    if (direction === 'horizontal') {
        newTransform = currentTransform.includes('scaleX(-1)') 
            ? currentTransform.replace('scaleX(-1)', '').trim()
            : `${currentTransform} scaleX(-1)`.trim();
    } else {
        newTransform = currentTransform.includes('scaleY(-1)')
            ? currentTransform.replace('scaleY(-1)', '').trim()
            : `${currentTransform} scaleY(-1)`.trim();
    }
    updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, transform: newTransform } });
  };
  
  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <div className="bg-background rounded-lg shadow-md p-1 flex items-center gap-1 border">
        <Button variant="ghost" size="sm" onClick={handleReplaceImage}>
          <Replace size={16} className="mr-2" /> Alterar Imagem
        </Button>
        <div className="h-6 border-l mx-1"></div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Brush size={16} className="mr-2" /> Editar Imagem
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-4">
            <h4 className="font-medium leading-none">Edição Rápida</h4>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleFlip('horizontal')}><FlipHorizontal size={16} className="mr-2"/> Horizontal</Button>
                    <Button variant="outline" onClick={() => handleFlip('vertical')}><FlipVertical size={16} className="mr-2"/> Vertical</Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Brilho</Label>
                <Slider defaultValue={[imageFilters.brightness]} max={200} step={1} onValueChange={([val]) => handleFilterChange('brightness', val)} />
            </div>
            <div className="space-y-2">
                <Label>Contraste</Label>
                <Slider defaultValue={[imageFilters.contrast]} max={200} step={1} onValueChange={([val]) => handleFilterChange('contrast', val)} />
            </div>
            <div className="space-y-2">
                <Label>Saturação</Label>
                <Slider defaultValue={[imageFilters.saturate]} max={200} step={1} onValueChange={([val]) => handleFilterChange('saturate', val)} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={onUploadComplete} 
      />
    </>
  );
};

export default ImageFormattingToolbar;