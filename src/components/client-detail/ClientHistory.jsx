import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Importação adicionada
import { CalendarDays, DollarSign, Briefcase, ArrowRightCircle } from 'lucide-react';
import { parseISO, format as formatDateFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Se Badge não existir, um componente simples pode ser:
// const Badge = ({ children, variant = 'default', className }) => {
//   const variants = {
//     default: 'bg-primary text-primary-foreground',
//     secondary: 'bg-secondary text-secondary-foreground',
//     destructive: 'bg-destructive text-destructive-foreground',
//     outline: 'text-foreground',
//   };
//   return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>{children}</span>;
// };


const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center text-lg font-semibold text-primary mb-6 mt-2 border-b border-border pb-3">
    <Icon className="w-6 h-6 mr-3 text-primary" />
    {title}
  </div>
);

const ClientHistory = ({ clientId }) => {
  const { workflowCards, getStatusLabel } = useData();
  const navigate = useNavigate();

  const clientWorkflowHistory = useMemo(() => {
    return workflowCards
      .filter(card => card.client_id === clientId && !card.archived)
      .sort((a, b) => {
        const dateA = a.date ? parseISO(a.date) : new Date(0);
        const dateB = b.date ? parseISO(b.date) : new Date(0);
        return dateB - dateA; // Ordena do mais recente para o mais antigo
      });
  }, [workflowCards, clientId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Adiciona T00:00:00 para tratar a string como data local e evitar problemas de fuso horário com parseISO
      const date = parseISO(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
      return formatDateFns(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", dateString, e);
      return 'Data inválida';
    }
  };

  const handleCardClick = (cardId) => {
    navigate(`/workflow?openCard=${cardId}`);
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'concluido': return 'bg-green-500 hover:bg-green-600';
      case 'agendado': return 'bg-blue-500 hover:bg-blue-600';
      case 'em-andamento': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'proposta-enviada': return 'bg-orange-300 hover:bg-purple-600';
      case 'novo-lead': return 'bg-pink-500 hover:bg-pink-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };


  return (
    <div className="space-y-6">
      <SectionTitle icon={Briefcase} title="Histórico de Serviços Prestados" />
      {clientWorkflowHistory.length > 0 ? (
        <ScrollArea className="h-[600px] pr-4 -mr-4">
          <div className="space-y-4">
            {clientWorkflowHistory.map((card) => (
              <Card 
                key={card.id} 
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-primary cursor-pointer"
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h3 className="text-lg font-semibold text-foreground mb-1 sm:mb-0">
                      {card.title || 'Serviço não especificado'}
                    </h3>
                    <Badge className={`text-xs text-white ${getStatusBadgeVariant(card.status)}`}>
                      {getStatusLabel(card.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                      <span>Data: {formatDate(card.date)} {card.time ? `às ${card.time}` : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-primary" />
                      <span>Valor: {formatCurrency(card.value)}</span>
                    </div>
                  </div>
                  
                  {card.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-2">
                      {card.description}
                    </p>
                  )}
                  <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          Ver Detalhes no Fluxo
                          <ArrowRightCircle className="w-4 h-4 ml-2" />
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-10">
          <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum serviço prestado encontrado para este cliente.</p>
        </div>
      )}
    </div>
  );
};

export default ClientHistory;