import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FilePlus, FileText } from 'lucide-react';

const CreateContractModal = ({ isOpen, onOpenChange, onAction }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
          <DialogDescription>Gere contratos seguros e com validade jurídica em minutos.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => onAction('blank')}>
            <FilePlus className="w-8 h-8" />
            <span>Criar em Branco</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => onAction('template')}>
            <FileText className="w-8 h-8" />
            <span>Usar um Modelo</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractModal;