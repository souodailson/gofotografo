import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Calendar, DollarSign, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFreela } from '@/contexts/FreelaContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FreelaApplications = () => {
  const { applications, loadApplications, loading } = useFreela();

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const formatCurrency = (value) => {
    if (!value) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: ptBR 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'withdrawn':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Rejeitada';
      case 'withdrawn':
        return 'Retirada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
        <p className="text-gray-600">Acompanhe o status das suas candidaturas</p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma candidatura enviada
            </h3>
            <p className="text-gray-500">
              Procure por trabalhos interessantes e envie suas candidaturas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{application.job?.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <span>Candidatura enviada {formatDate(application.created_at)}</span>
                        <Badge 
                          variant={application.job?.status === 'open' ? 'default' : 'secondary'}
                          className={application.job?.status === 'open' ? 'bg-green-500' : ''}
                        >
                          Trabalho {application.job?.status === 'open' ? 'Aberto' : 
                                   application.job?.status === 'in_progress' ? 'Em Andamento' :
                                   application.job?.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(application.status)} text-white`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(application.status)}
                        <span>{getStatusLabel(application.status)}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {application.job?.location}
                    </div>
                    {application.job?.job_date && (
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(application.job.job_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {application.job?.budget_min && application.job?.budget_max 
                        ? `${formatCurrency(application.job.budget_min)} - ${formatCurrency(application.job.budget_max)}`
                        : formatCurrency(application.job?.budget_min || application.job?.budget_max)
                      }
                    </div>
                    <div className="text-gray-500">
                      Status: {getStatusLabel(application.job?.status)}
                    </div>
                  </div>
                  
                  {/* Application Details */}
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Sua Proposta</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          {application.proposed_rate && (
                            <div>
                              <span className="font-medium">Valor Proposto:</span>
                              <span className="ml-2">{formatCurrency(application.proposed_rate)}</span>
                            </div>
                          )}
                          {application.estimated_hours && (
                            <div>
                              <span className="font-medium">Tempo Estimado:</span>
                              <span className="ml-2">{application.estimated_hours} horas</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-sm">Mensagem:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Response Message */}
                    {application.response_message && (
                      <div>
                        <h4 className="font-medium mb-2">Resposta do Cliente</h4>
                        <div className={`p-3 rounded-lg ${
                          application.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                          application.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">
                            {application.response_message}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Portfolio Samples */}
                    {application.portfolio_samples && application.portfolio_samples.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amostras Enviadas</h4>
                        <div className="flex space-x-2">
                          {application.portfolio_samples.slice(0, 4).map((sample, idx) => (
                            <img
                              key={idx}
                              src={sample}
                              alt={`Amostra ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                          {application.portfolio_samples.length > 4 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                              +{application.portfolio_samples.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelaApplications;