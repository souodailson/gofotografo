import React, { useState } from 'react';
import { FileText, Download, Printer, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ReceiptGenerator from './ReceiptGenerator';

const ReceiptButton = ({ 
  transaction, 
  size = 'sm', 
  variant = 'outline',
  className = '',
  showDropdown = true 
}) => {
  const { settings } = useData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReceipt = async (action = 'download') => {
    if (!transaction) {
      toast({
        title: 'Erro',
        description: 'Dados da transação não encontrados',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      switch (action) {
        case 'download':
          await ReceiptGenerator.downloadPDF(transaction, settings);
          toast({
            title: 'Comprovante baixado!',
            description: 'O arquivo PDF foi baixado com sucesso'
          });
          break;
          
        case 'view':
          await ReceiptGenerator.openPDF(transaction, settings);
          break;
          
        case 'print':
          await ReceiptGenerator.printPDF(transaction, settings);
          toast({
            title: 'Enviado para impressão',
            description: 'Verifique sua impressora'
          });
          break;
          
        default:
          await ReceiptGenerator.downloadPDF(transaction, settings);
      }
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      toast({
        title: 'Erro ao gerar comprovante',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showDropdown) {
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={() => handleGenerateReceipt('download')}
        disabled={isLoading}
      >
        <FileText className="w-4 h-4 mr-2" />
        {isLoading ? 'Gerando...' : 'Comprovante'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          className={className}
          disabled={isLoading}
        >
          <FileText className="w-4 h-4 mr-2" />
          {isLoading ? 'Gerando...' : 'Comprovante'}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleGenerateReceipt('download')}>
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerateReceipt('view')}>
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerateReceipt('print')}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReceiptButton;