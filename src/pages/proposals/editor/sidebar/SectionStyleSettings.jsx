import React, { useRef, useMemo } from 'react';
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { useEditorState } from '@/hooks/useEditorState';


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


const SectionStyleSettings = ({ selectedSection, setProposal, proposal, onUploadComplete, viewMode }) => {
    const styles = selectedSection.styles || {};
    const { user } = useData();
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const currentHeight = useMemo(() => {
        if (viewMode !== 'desktop' && selectedSection.layouts?.[viewMode]?.height) {
            return selectedSection.layouts[viewMode].height;
        }
        return selectedSection.height || 500;
    }, [selectedSection, viewMode]);

    const handleStyleChange = (property, value) => {
        if (!selectedSection) return;

        let newStyles = { ...selectedSection.styles, [property]: value };

        if (property === 'backgroundImage' && value) {
            newStyles.zIndex = 0;
        }

        setProposal(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === selectedSection.id ? { ...s, styles: newStyles } : s)
        }));
    };
    
    const handleHeightChange = (height) => {
        if (!selectedSection) return;
        const newHeight = parseInt(height) || 500;
        setProposal(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== selectedSection.id) return s;
                
                const updatedSection = { ...s };
                if (viewMode === 'desktop') {
                    updatedSection.height = newHeight;
                } else {
                    if (!updatedSection.layouts) updatedSection.layouts = {};
                    if (!updatedSection.layouts[viewMode]) updatedSection.layouts[viewMode] = {};
                    updatedSection.layouts[viewMode].height = newHeight;
                }
                return updatedSection;
            })
        }));
    };

    const handleImageUpload = async (event) => {
        if (!selectedSection || !user) return;
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
        if(onUploadComplete) onUploadComplete();
        toast({ title: 'Imagem de fundo atualizada!', variant: 'success' });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium mt-4">Dimensões da Seção ({viewMode})</p>
            <StyleControl label="Altura (px)">
                <Input type="number" value={currentHeight} onChange={e => handleHeightChange(e.target.value)} min="100" />
            </StyleControl>
            <p className="text-sm font-medium mt-4">Fundo da Seção</p>
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
                    <Input type="text" placeholder="URL da imagem" value={(styles.backgroundImage || '').replace(/url\((['"]?)(.*?)\1\)/, '$2')} onChange={e => handleStyleChange('backgroundImage', e.target.value)} />
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
        </div>
    );
};

export default SectionStyleSettings;