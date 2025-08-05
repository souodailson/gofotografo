import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const BlockAdvancedSettings = ({ selectedBlock, updateBlock }) => {
  const animation = selectedBlock.animation || {};

  const handleVisibilityChange = (device, isVisible) => {
    if (!selectedBlock) return;
    const visibility = { ...selectedBlock.visibility, [device]: isVisible };
    updateBlock(selectedBlock.id, { visibility });
  };
  
  const handleLayerChange = (amount) => {
    if (!selectedBlock) return;
    const currentZIndex = selectedBlock.styles?.zIndex || 0;
    let newZIndex;
    if (amount === Infinity) newZIndex = 999;
    else if (amount === -Infinity) newZIndex = 0;
    else newZIndex = Math.max(0, currentZIndex + amount);

    updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, zIndex: newZIndex } });
  };

  const handleAnimationChange = (property, value) => {
    if (!selectedBlock) return;
    const newAnimation = { ...selectedBlock.animation, [property]: value };
    updateBlock(selectedBlock.id, { animation: newAnimation });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Camadas (Z-index)</p>
      <TooltipProvider>
        <div className="flex items-center justify-between gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-1" onClick={() => handleLayerChange(-Infinity)}><ChevronsDown size={16}/></Button>
                </TooltipTrigger>
                <TooltipContent>Mover para o fundo</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-1" onClick={() => handleLayerChange(-1)}><ChevronDown size={16}/></Button>
                </TooltipTrigger>
                <TooltipContent>Mover para trás</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-1" onClick={() => handleLayerChange(1)}><ChevronUp size={16}/></Button>
                </TooltipTrigger>
                <TooltipContent>Mover para frente</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-1" onClick={() => handleLayerChange(Infinity)}><ChevronsUp size={16}/></Button>
                </TooltipTrigger>
                <TooltipContent>Mover para o topo</TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>

      <p className="text-sm font-medium pt-4">Animação de Entrada</p>
      <div className="grid grid-cols-3 items-center gap-2 mb-2">
        <Label className="col-span-1 text-xs text-muted-foreground">Tipo</Label>
        <div className="col-span-2">
          <Select value={animation.type || 'none'} onValueChange={v => handleAnimationChange('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="fadeIn">Fade In</SelectItem>
              <SelectItem value="slideInUp">Slide In Up</SelectItem>
              <SelectItem value="slideInDown">Slide In Down</SelectItem>
              <SelectItem value="slideInLeft">Slide In Left</SelectItem>
              <SelectItem value="slideInRight">Slide In Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-2 mb-2">
        <Label className="col-span-1 text-xs text-muted-foreground">Duração (s)</Label>
        <div className="col-span-2">
          <Input type="number" step="0.1" value={animation.duration || 0.5} onChange={e => handleAnimationChange('duration', parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-2 mb-2">
        <Label className="col-span-1 text-xs text-muted-foreground">Atraso (s)</Label>
        <div className="col-span-2">
          <Input type="number" step="0.1" value={animation.delay || 0} onChange={e => handleAnimationChange('delay', parseFloat(e.target.value))} />
        </div>
      </div>

      <p className="text-sm font-medium pt-4">Visibilidade Responsiva</p>
      <div className="flex items-center justify-between">
          <Label>Desktop</Label>
          <Switch checked={selectedBlock.visibility?.desktop ?? true} onCheckedChange={v => handleVisibilityChange('desktop', v)} />
      </div>
      <div className="flex items-center justify-between">
          <Label>Tablet</Label>
          <Switch checked={selectedBlock.visibility?.tablet ?? true} onCheckedChange={v => handleVisibilityChange('tablet', v)} />
      </div>
      <div className="flex items-center justify-between">
          <Label>Mobile</Label>
          <Switch checked={selectedBlock.visibility?.mobile ?? true} onCheckedChange={v => handleVisibilityChange('mobile', v)} />
      </div>
    </div>
  );
};

export default BlockAdvancedSettings;