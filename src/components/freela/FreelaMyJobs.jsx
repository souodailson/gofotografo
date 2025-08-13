import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, Users, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFreela } from '@/contexts/FreelaContext';
import * as freelaApi from '@/lib/db/freelaApi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FreelaJobModal from './FreelaJobModal';

const FreelaMyJobs = () => {
  const { profile, urgencyLevels } = useFreela();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [applications, setApplications] = useState({});

  const loadMyJobs = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // Busca trabalhos postados pelo usuário
      const allJobs = await freelaApi.getJobs({});
      const userJobs = allJobs.filter(job => job.posted_by === profile.id);
      setMyJobs(userJobs);

      // Carrega candidaturas para cada trabalho
      const applicationsData = {};
      for (const job of userJobs) {
        try {
          const jobApplications = await freelaApi.getApplicationsForJob(job.id);
          applicationsData[job.id] = jobApplications;
        } catch (error) {
          console.error(`Erro ao carregar candidaturas do trabalho ${job.id}:`, error);
          applicationsData[job.id] = [];
        }
      }
      setApplications(applicationsData);
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyJobs();
  }, [profile]);

  const handleNewJob = () => {
    setSelectedJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Tem certeza que deseja excluir este trabalho?')) return;
    
    try {
      await freelaApi.deleteJob(jobId);
      setMyJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Erro ao excluir trabalho:', error);
    }
  };

  const handleApplicationAction = async (applicationId, action, responseMessage = '') => {
    try {
      await freelaApi.updateApplication(applicationId, {
        status: action,
        response_message: responseMessage
      });
      
      // Recarrega as candidaturas
      loadMyJobs();
    } catch (error) {
      console.error('Erro ao atualizar candidatura:', error);
    }
  };

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

  const categoryLabels = {
    fotografia: 'Fotografia',
    filmmaker: 'Filmmaker',
    storymaker: 'Storymaker',
    editor_video: 'Editor de Vídeo',
    editor_foto: 'Editor de Foto',
    motion_design: 'Motion Design',
    designer_grafico: 'Designer Gráfico',
    social_media: 'Social Media',
    drone: 'Drone/Aéreo',
    livestream: 'Livestream',
    producao: 'Produção',
    assistente: 'Assistente'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Trabalhos</h1>
          <p className="text-gray-600">Gerencie os trabalhos que você publicou</p>
        </div>
        <Button onClick={handleNewJob} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Trabalho
        </Button>
      </div>

      {/* Jobs List */}
      {myJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum trabalho publicado
            </h3>
            <p className="text-gray-500 mb-4">
              Publique seu primeiro trabalho para começar a receber candidaturas.
            </p>
            <Button onClick={handleNewJob} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Publicar Trabalho
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <Badge variant="outline">
                          {categoryLabels[job.category] || job.category}
                        </Badge>
                        {job.urgency !== 'normal' && (
                          <Badge 
                            variant="outline"
                            className={`${urgencyLevels.find(u => u.value === job.urgency)?.color} text-white`}
                          >
                            {urgencyLevels.find(u => u.value === job.urgency)?.label}
                          </Badge>
                        )}
                        <Badge 
                          variant={job.status === 'open' ? 'default' : 'secondary'}
                          className={job.status === 'open' ? 'bg-green-500' : ''}
                        >
                          {job.status === 'open' ? 'Aberto' : 
                           job.status === 'in_progress' ? 'Em Andamento' :
                           job.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    {job.job_date && (
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(job.job_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.budget_min && job.budget_max 
                        ? `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`
                        : formatCurrency(job.budget_min || job.budget_max)
                      }
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {applications[job.id]?.length || 0} candidatos
                    </div>
                  </div>
                  
                  {/* Applications Preview */}
                  {applications[job.id] && applications[job.id].length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        Candidaturas Recentes ({applications[job.id].length})
                      </h4>
                      <div className="space-y-2">
                        {applications[job.id].slice(0, 3).map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                {application.freelancer?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{application.freelancer?.name}</div>
                                <div className="text-xs text-gray-500">
                                  {application.proposed_rate && formatCurrency(application.proposed_rate)}
                                  {application.estimated_hours && ` • ${application.estimated_hours}h`}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={
                                  application.status === 'pending' ? 'outline' :
                                  application.status === 'accepted' ? 'default' : 'secondary'
                                }
                                className={
                                  application.status === 'accepted' ? 'bg-green-500' :
                                  application.status === 'rejected' ? 'bg-red-500 text-white' : ''
                                }
                              >
                                {application.status === 'pending' ? 'Pendente' :
                                 application.status === 'accepted' ? 'Aceita' :
                                 application.status === 'rejected' ? 'Rejeitada' : 'Retirada'}
                              </Badge>
                              
                              {application.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplicationAction(application.id, 'accepted')}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    Aceitar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplicationAction(application.id, 'rejected')}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    Rejeitar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {applications[job.id].length > 3 && (
                          <p className="text-sm text-gray-500 text-center pt-2">
                            +{applications[job.id].length - 3} candidaturas
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Job Modal */}
      <FreelaJobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setSelectedJob(null);
          loadMyJobs(); // Recarrega a lista após fechar o modal
        }}
        job={selectedJob}
      />
    </div>
  );
};

export default FreelaMyJobs;