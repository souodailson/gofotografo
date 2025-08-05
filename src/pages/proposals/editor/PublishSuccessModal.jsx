import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ExternalLink, MessageSquare, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PublishSuccessModal = ({ isOpen, onClose, publicUrl, proposalName }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira minha proposta: ${proposalName}\n${publicUrl}`)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(proposalName)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(`Confira minha proposta: ${proposalName}`)}`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proposta Publicada com Sucesso!</DialogTitle>
          <DialogDescription>Sua proposta está online e pronta para ser compartilhada.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input value={publicUrl} readOnly />
            <Button size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button asChild className="w-full">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir em nova aba
            </a>
          </Button>
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Compartilhar:</span>
            <Button asChild variant="ghost" size="icon"><a href={shareOptions.whatsapp} target="_blank" rel="noopener noreferrer"><MessageSquare /></a></Button>
            <Button asChild variant="ghost" size="icon"><a href={shareOptions.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a></Button>
            <Button asChild variant="ghost" size="icon"><a href={shareOptions.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a></Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishSuccessModal;