import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, Trash2, Ban } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';

const StyleControl = ({ label, children }) => (
  <div className="grid grid-cols-3 items-center gap-2 mb-2">
    <Label className="col-span-1 text-xs text-muted-foreground truncate" title={label}>{label}</Label>
    <div className="col-span-2">{children}</div>
  </div>
);

const ColorPicker = ({ value, onChange, onClear }) => (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 flex-grow justify-start px-2"
            style={{ backgroundColor: value || 'transparent' }}
          >
            <div className="w-4 h-4 rounded-sm border border-gray-400 mr-2" style={{ backgroundColor: value || 'white' }}></div>
            <span className="text-xs">{value || 'Nenhuma'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none">
          <HexColorPicker color={value || '#ffffff'} onChange={onChange} />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}><Ban size={16} /></Button>
    </div>
);


const FourWayInput = ({ label, valueTop, valueRight, valueBottom, valueLeft, onChange }) => {
    const handleChange = (side, val) => {
        const numValue = parseInt(val) || 0;
        onChange(side, `${numValue}px`);
    };

    return (
        <div>
            <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
            <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Topo" value={parseInt(valueTop) || ''} onChange={e => handleChange('Top', e.target.value)} className="h-8" />
                <Input type="number" placeholder="Direita" value={parseInt(valueRight) || ''} onChange={e => handleChange('Right', e.target.value)} className="h-8" />
                <Input type="number" placeholder="Fundo" value={parseInt(valueBottom) || ''} onChange={e => handleChange('Bottom', e.target.value)} className="h-8" />
                <Input type="number" placeholder="Esquerda" value={parseInt(valueLeft) || ''} onChange={e => handleChange('Left', e.target.value)} className="h-8" />
            </div>
        </div>
    );
};

const SpacingInput = ({ value, onChange, unit = 'px' }) => {
    const numValue = parseFloat(value) || 0;
    return (
        <div className="flex items-center gap-1">
            <Input type="number" value={numValue} onChange={e => onChange(`${e.target.value}${unit}`)} className="h-8 w-16" />
            <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
    )
};


const BlockStyleSettings = ({ selectedBlock, updateBlock, proposal, onUploadComplete }) => {
    const styles = selectedBlock.styles || {};
    const size = selectedBlock.size || {};
    const { user } = useData();
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const handleStyleChange = (property, value) => {
        if (!selectedBlock) return;
        const newStyles = { ...selectedBlock.styles, [property]: value };
        updateBlock(selectedBlock.id, { styles: newStyles });
    };

    const handleSizeChange = (property, value) => {
        if (!selectedBlock) return;
        const newSize = { ...selectedBlock.size, [property]: value };
        updateBlock(selectedBlock.id, { size: newSize });
    };

    const handleFourWayStyleChange = (baseProperty, side, value) => {
        if (!selectedBlock) return;
        const property = `${baseProperty}${side}`;
        handleStyleChange(property, value);
    };

    const handleImageUpload = async (event) => {
        if (!selectedBlock || !user) return;
        const file = event.target.files[0];
        if (!file) return;
    
        toast({ title: 'Enviando imagem...', description: 'Aguarde um momento.' });
    
        const filePath = `${user.id}/${proposal.id || 'new'}/${uuidv4()}-${file.name}`;
    
        const { error: uploadError } = await supabase.storage.from('propostas').upload(filePath, file);
    
        if (uploadError) {
          toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
          return;
        }
    
        const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(filePath);
        
        handleStyleChange('backgroundImage', publicUrl);
        onUploadComplete();
        toast({ title: 'Imagem de fundo atualizada!', variant: 'success' });
    };

    const renderTextSettings = () => (
        <>
            <p className="text-sm font-medium mt-4">Texto</p>
            <StyleControl label="Cor Texto">
                <ColorPicker
                    value={styles.color}
                    onChange={color => handleStyleChange('color', color)}
                    onClear={() => handleStyleChange('color', '')}
                />
            </StyleControl>
            <StyleControl label="Alinhamento">
              <Select value={styles.textAlign || 'left'} onValueChange={val => handleStyleChange('textAlign', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                  <SelectItem value="justify">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </StyleControl>
            <StyleControl label="Altura Linha"><SpacingInput value={styles.lineHeight} onChange={v => handleStyleChange('lineHeight', v)} unit=""/></StyleControl>
            <StyleControl label="Espaço Letras"><SpacingInput value={styles.letterSpacing} onChange={v => handleStyleChange('letterSpacing', v)} /></StyleControl>
        </>
    );

    const renderImageSettings = () => (
        <>
            <p className="text-sm font-medium mt-4">Imagem</p>
            <StyleControl label="Ajuste">
              <Select value={styles.objectFit || 'cover'} onValueChange={val => handleStyleChange('objectFit', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="cover">Cobrir</SelectItem>
                    <SelectItem value="contain">Conter</SelectItem>
                    <SelectItem value="fill">Preencher</SelectItem>
                    <SelectItem value="none">Nenhum</SelectItem>
                </SelectContent>
              </Select>
            </StyleControl>
            <StyleControl label="Posição">
              <Input value={styles.objectPosition || 'center'} onChange={e => handleStyleChange('objectPosition', e.target.value)} placeholder="ex: 50% 50%"/>
            </StyleControl>
        </>
    );

    const renderButtonSettings = () => (
        <>
            <p className="text-sm font-medium mt-4">Botão</p>
            <StyleControl label="Cor Texto">
                 <ColorPicker
                    value={styles.color}
                    onChange={color => handleStyleChange('color', color)}
                    onClear={() => handleStyleChange('color', '')}
                />
            </StyleControl>
            <StyleControl label="Alinhamento">
              <Select value={styles.textAlign || 'center'} onValueChange={val => handleStyleChange('textAlign', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </StyleControl>
            <p className="text-sm font-medium mt-4">Hover (Mouse Over)</p>
            <StyleControl label="Cor Fundo">
                 <ColorPicker
                    value={styles.hoverBackgroundColor}
                    onChange={color => handleStyleChange('hoverBackgroundColor', color)}
                    onClear={() => handleStyleChange('hoverBackgroundColor', '')}
                />
            </StyleControl>
            <StyleControl label="Cor Texto">
                 <ColorPicker
                    value={styles.hoverColor}
                    onChange={color => handleStyleChange('hoverColor', color)}
                    onClear={() => handleStyleChange('hoverColor', '')}
                />
            </StyleControl>
            <StyleControl label="Escala"><Input type="number" step="0.05" value={styles.hoverScale || 1} onChange={e => handleStyleChange('hoverScale', parseFloat(e.target.value))} /></StyleControl>
        </>
    );

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Layout</p>
            <div className="flex items-center justify-between">
                <Label>Largura Total</Label>
                <Switch checked={styles.fullWidth ?? false} onCheckedChange={v => handleStyleChange('fullWidth', v)} />
            </div>
             <div className="flex items-center justify-between">
                <Label>Altura Automática</Label>
                <Switch checked={size.height === 'auto'} onCheckedChange={v => handleSizeChange('height', v ? 'auto' : '20%')} />
            </div>

            <p className="text-sm font-medium mt-4">Espaçamento</p>
            <FourWayInput label="Preenchimento (Padding)"
                valueTop={styles.paddingTop} valueRight={styles.paddingRight}
                valueBottom={styles.paddingBottom} valueLeft={styles.paddingLeft}
                onChange={(side, value) => handleFourWayStyleChange('padding', side, value)} />
            <FourWayInput label="Margem (Margin)"
                valueTop={styles.marginTop} valueRight={styles.marginRight}
                valueBottom={styles.marginBottom} valueLeft={styles.marginLeft}
                onChange={(side, value) => handleFourWayStyleChange('margin', side, value)} />
            
            {selectedBlock.type === 'text' && renderTextSettings()}
            {selectedBlock.type === 'image' && renderImageSettings()}
            {selectedBlock.type === 'button' && renderButtonSettings()}

            {selectedBlock.type !== 'pdf' && (
                <>
                    <p className="text-sm font-medium mt-4">Fundo</p>
                    <StyleControl label="Cor Fundo">
                        <ColorPicker
                            value={styles.backgroundColor}
                            onChange={color => handleStyleChange('backgroundColor', color)}
                            onClear={() => handleStyleChange('backgroundColor', '')}
                        />
                    </StyleControl>
                    <StyleControl label="Opacidade Fundo">
                    <Slider
                            value={[styles.backgroundOpacity ?? 1]}
                            max={1}
                            step={0.05}
                            onValueChange={([val]) => handleStyleChange('backgroundOpacity', val)}
                        />
                    </StyleControl>
                    <div className="space-y-2">
                        <Label>Imagem de Fundo</Label>
                        <div className="flex items-center gap-2">
                            <Input type="text" placeholder="URL da imagem" value={styles.backgroundImage || ''} onChange={e => handleStyleChange('backgroundImage', e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}><Upload size={16}/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleStyleChange('backgroundImage', '')}><Trash2 size={16}/></Button>
                            <Input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>
                    {styles.backgroundImage && (
                        <div className="space-y-4 border-t pt-4 mt-4">
                            <StyleControl label="Posição">
                                <Select value={styles.backgroundPosition || 'center'} onValueChange={v => handleStyleChange('backgroundPosition', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left top">Topo Esquerda</SelectItem>
                                        <SelectItem value="center top">Topo Centro</SelectItem>
                                        <SelectItem value="right top">Topo Direita</SelectItem>
                                        <SelectItem value="left center">Meio Esquerda</SelectItem>
                                        <SelectItem value="center center">Centro</SelectItem>
                                        <SelectItem value="right center">Meio Direita</SelectItem>
                                        <SelectItem value="left bottom">Fundo Esquerda</SelectItem>
                                        <SelectItem value="center bottom">Fundo Centro</SelectItem>
                                        <SelectItem value="right bottom">Fundo Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                            </StyleControl>
                            <StyleControl label="Tamanho">
                                <Select value={styles.backgroundSize || 'cover'} onValueChange={v => handleStyleChange('backgroundSize', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cover">Cobrir</SelectItem>
                                        <SelectItem value="contain">Conter</SelectItem>
                                        <SelectItem value="auto">Original</SelectItem>
                                    </SelectContent>
                                </Select>
                            </StyleControl>
                            <StyleControl label="Repetir">
                                <Select value={styles.backgroundRepeat || 'no-repeat'} onValueChange={v => handleStyleChange('backgroundRepeat', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-repeat">Não Repetir</SelectItem>
                                        <SelectItem value="repeat">Repetir</SelectItem>
                                        <SelectItem value="repeat-x">Repetir X</SelectItem>
                                        <SelectItem value="repeat-y">Repetir Y</SelectItem>
                                    </SelectContent>
                                </Select>
                            </StyleControl>
                            <StyleControl label="Rolagem">
                                <Select value={styles.backgroundAttachment || 'scroll'} onValueChange={v => handleStyleChange('backgroundAttachment', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scroll">Rolar com a página</SelectItem>
                                        <SelectItem value="fixed">Fixo (Parallax)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </StyleControl>
                            <p className="text-sm font-medium mt-4">Overlay de Cor</p>
                            <StyleControl label="Cor">
                                <ColorPicker
                                    value={styles.overlayColor}
                                    onChange={color => handleStyleChange('overlayColor', color)}
                                    onClear={() => handleStyleChange('overlayColor', '')}
                                />
                            </StyleControl>
                            <StyleControl label="Opacidade">
                            <Slider
                                    value={[styles.overlayOpacity || 0.3]}
                                    max={1}
                                    step={0.05}
                                    onValueChange={([val]) => handleStyleChange('overlayOpacity', val)}
                                />
                            </StyleControl>
                        </div>
                    )}
                </>
            )}
            
            <p className="text-sm font-medium mt-4">Borda</p>
             <StyleControl label="Cor">
                <ColorPicker
                    value={styles.borderColor}
                    onChange={color => handleStyleChange('borderColor', color)}
                    onClear={() => handleStyleChange('borderColor', '')}
                />
            </StyleControl>
            <StyleControl label="Largura"><SpacingInput value={styles.borderWidth} onChange={v => handleStyleChange('borderWidth', v)} /></StyleControl>
            <StyleControl label="Estilo">
                <Select value={styles.borderStyle || 'none'} onValueChange={v => handleStyleChange('borderStyle', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="solid">Sólido</SelectItem>
                        <SelectItem value="dashed">Tracejado</SelectItem>
                        <SelectItem value="dotted">Pontilhado</SelectItem>
                    </SelectContent>
                </Select>
            </StyleControl>
            <StyleControl label="Raio da Borda"><SpacingInput value={styles.borderRadius} onChange={v => handleStyleChange('borderRadius', v)} /></StyleControl>
        </div>
    );
};

export default BlockStyleSettings;