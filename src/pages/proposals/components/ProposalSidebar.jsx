import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { availableSections, fontOptions, fontMap } from '@/pages/proposals/proposalConstants';
import { Info, Package, Image as ImageIcon, HelpCircle, Star, MessageSquare, Link2, User, Layers } from 'lucide-react';

const iconMap = {
  Cover: <Layers className="w-4 h-4" />,
  Info: <Info className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Link2: <Link2 className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
};

const ProposalSidebar = ({ proposal, setProposal, clients, addSection, isAdmin }) => {
  const [selectedFontPairKey, setSelectedFontPairKey] = useState(proposal?.theme?.fontPair || 'playfair_lato');

  useEffect(() => {
    setSelectedFontPairKey(proposal?.theme?.fontPair || 'playfair_lato');
  }, [proposal?.theme?.fontPair]);

  const handleThemeChange = (path, value) => {
    const keys = path.split('.');
    setProposal(p => {
      let newP = { ...p };
      let current = newP;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newP;
    });
  };

  const theme = proposal.theme || {};
  const selectedFontPair = fontMap[selectedFontPairKey] || fontMap.playfair_lato;

  return (
    <aside className="w-80 bg-background p-4 border-r overflow-y-auto scrollbar-thin">
      <h2 className="text-lg font-semibold mb-4">{isAdmin ? 'Configurações do Modelo' : 'Configurações da Proposta'}</h2>
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>{isAdmin ? 'Nome do Modelo' : 'Título da Proposta'}</Label>
              <Input value={proposal.nome_da_proposta || ''} onChange={e => setProposal(p => ({ ...p, nome_da_proposta: e.target.value }))} />
              {!isAdmin && (
                <>
                  <Label>Cliente</Label>
                  <Select value={proposal.client_id || 'none'} onValueChange={val => setProposal(p => ({ ...p, client_id: val === 'none' ? null : val }))}>
                    <SelectTrigger><SelectValue placeholder="Vincular cliente..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {(clients || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Adicionar Seção</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {availableSections.map(s => (
                <Button key={s.type} variant="outline" onClick={() => addSection(s.type)} className="flex items-center gap-2 justify-start text-xs h-9">
                  {iconMap[s.icon]} {s.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="design" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Cores</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>Cor Primária (Títulos)</Label>
              <Input type="color" value={theme.primaryColor || '#333333'} onChange={e => handleThemeChange('theme.primaryColor', e.target.value)} />
              <Label>Cor do Texto</Label>
              <Input type="color" value={theme.textColor || '#555555'} onChange={e => handleThemeChange('theme.textColor', e.target.value)} />
              <Label>Cor de Destaque</Label>
              <Input type="color" value={theme.secondaryColor || '#ecce9a'} onChange={e => handleThemeChange('theme.secondaryColor', e.target.value)} />
              <Label>Cor de Fundo</Label>
              <Input type="color" value={theme.backgroundColor || '#ffffff'} onChange={e => handleThemeChange('theme.backgroundColor', e.target.value)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Fontes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>Combinação de Fontes</Label>
              <Select value={selectedFontPairKey} onValueChange={val => { handleThemeChange('theme.fontPair', val); setSelectedFontPairKey(val); }}>
                <SelectTrigger><SelectValue placeholder="Escolha as fontes..." /></SelectTrigger>
                <SelectContent>
                  {fontOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="mt-4 p-3 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Preview:</p>
                <p style={{ fontFamily: `'${selectedFontPair.heading}', serif` }} className="text-lg font-bold">O ensaio perfeito</p>
                <p style={{ fontFamily: `'${selectedFontPair.body}', sans-serif` }}>começa com uma proposta perfeita.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default ProposalSidebar;