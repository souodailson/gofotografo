import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fontOptions, fontMap } from '@/pages/proposals/proposalConstants';

const StyleControl = ({ label, children }) => (
    <div className="grid grid-cols-3 items-center gap-2 mb-2">
      <Label className="col-span-1 text-xs text-muted-foreground truncate" title={label}>{label}</Label>
      <div className="col-span-2">{children}</div>
    </div>
);
  
const GlobalStyleSettings = ({ globalStyles, setGlobalStyles }) => {
  return (
    <div className="space-y-4">
      <StyleControl label="Cor Títulos">
        <Input type="color" value={globalStyles.headingColor || '#111111'} onChange={e => setGlobalStyles({ ...globalStyles, headingColor: e.target.value })} />
      </StyleControl>
      <StyleControl label="Cor Texto">
        <Input type="color" value={globalStyles.textColor || '#333333'} onChange={e => setGlobalStyles({ ...globalStyles, textColor: e.target.value })} />
      </StyleControl>
      <StyleControl label="Cor Fundo">
        <Input type="color" value={globalStyles.backgroundColor || '#FFFFFF'} onChange={e => setGlobalStyles({ ...globalStyles, backgroundColor: e.target.value })} />
      </StyleControl>
       <StyleControl label="Cor Destaque">
        <Input type="color" value={globalStyles.accentColor || '#3B82F6'} onChange={e => setGlobalStyles({ ...globalStyles, accentColor: e.target.value })} />
      </StyleControl>
      <div className="space-y-2">
        <Label>Fontes</Label>
        <Select value={globalStyles.fontFamily?.key || 'playfair_lato'} onValueChange={key => setGlobalStyles({ ...globalStyles, fontFamily: { key, ...fontMap[key] } })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {fontOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GlobalStyleSettings;