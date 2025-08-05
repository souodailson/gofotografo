import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import AdvancedTemplate from '@/pages/proposals/templates/AdvancedTemplate';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PreviewModal = ({ isOpen, onClose, proposalData }) => {
  const proposalPreviewRef = useRef(null);

  const generatePdf = async () => {
    const input = proposalPreviewRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${proposalData.nome_da_proposta || 'proposta'}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-background w-full max-w-4xl h-[95vh] flex flex-col rounded-lg">
        <div className="p-4 border-b sticky top-0 bg-background z-10 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold">Preview da Proposta</h3>
          <div>
            <Button variant="outline" onClick={generatePdf} className="mr-2">
              <FileDown className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
        <div className="overflow-y-auto flex-grow">
          <div ref={proposalPreviewRef}>
            <AdvancedTemplate data={proposalData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;