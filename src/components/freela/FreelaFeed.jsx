import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Calendar, DollarSign, Clock, Eye, Users, Heart, MessageCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFreela } from '@/contexts/FreelaContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FreelaJobModal from './FreelaJobModal';
import FreelaApplicationModal from './FreelaApplicationModal';

const FreelaFeed = () => {
  const { 
    jobs, 
    loading, 
    loadJobs, 
    toggleFavorite, 
    checkIfFavorite, 
    checkIfApplied,
    categories, 
    regions,
    urgencyLevels 
  } = useFreela();
  
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    remote_work: '',
    urgency: ''
  });
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    loadJobs(filters);
  }, [filters, loadJobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }));
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
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
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Região</label>
              <Select onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as regiões</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Trabalho Remoto</label>
              <Select onValueChange={(value) => handleFilterChange('remote_work', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Apenas remotos</SelectItem>
                  <SelectItem value="false">Apenas presenciais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Urgência</label>
              <Select onValueChange={(value) => handleFilterChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Feed */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum trabalho encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou aguarde novos trabalhos serem publicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={job.posted_by_profile?.profile_image_url} />
                        <AvatarFallback>
                          {job.posted_by_profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.posted_by_profile?.name}</span>
                          {job.posted_by_profile?.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verificado
                            </Badge>
                          )}
                          <span>{formatDate(job.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Urgency Badge */}
                      {job.urgency !== 'normal' && (
                        <Badge 
                          variant="outline"
                          className={`${urgencyLevels.find(u => u.value === job.urgency)?.color} text-white`}
                        >
                          {urgencyLevels.find(u => u.value === job.urgency)?.label}
                        </Badge>
                      )}
                      
                      {/* Remote Badge */}
                      {job.remote_work && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Remoto
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Badge variant="outline" className="mr-2">
                        {categoryLabels[job.category] || job.category}
                      </Badge>
                    </div>
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
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {job.views_count || 0}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applications_count || 0} candidatos
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(job.id);
                        }}
                        className={checkIfFavorite(job.id) ? 'text-red-500' : 'text-gray-500'}
                      >
                        <Heart className={`w-4 h-4 ${checkIfFavorite(job.id) ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewJob(job)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver detalhes
                      </Button>
                      
                      {!checkIfApplied(job.id) && (
                        <Button
                          size="sm"
                          onClick={() => handleApplyJob(job)}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Candidatar
                        </Button>
                      )}
                      
                      {checkIfApplied(job.id) && (
                        <Badge variant="secondary">
                          Candidatura enviada
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modals */}
      <FreelaJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        job={selectedJob}
        readOnly
      />
      
      <FreelaApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default FreelaFeed;