import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, DollarSign, AlertCircle, Eye, Users, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFreela } from '@/contexts/FreelaContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FreelaFavorites = () => {
  const { 
    favorites, 
    loadFavorites, 
    toggleFavorite, 
    checkIfApplied, 
    urgencyLevels,
    loading 
  } = useFreela();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

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
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-500" />
          Trabalhos Favoritos
        </h1>
        <p className="text-gray-600">Trabalhos que você salvou para acompanhar</p>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum trabalho favoritado
            </h3>
            <p className="text-gray-500">
              Explore os trabalhos disponíveis e favorite os que mais te interessam.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite, index) => {
            const job = favorite.job;
            if (!job) return null;

            return (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
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
                            <span>Favoritado {formatDate(favorite.created_at)}</span>
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

                        {/* Status Badge */}
                        <Badge 
                          variant={job.status === 'open' ? 'default' : 'secondary'}
                          className={job.status === 'open' ? 'bg-green-500' : ''}
                        >
                          {job.status === 'open' ? 'Aberto' : 
                           job.status === 'in_progress' ? 'Em Andamento' :
                           job.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
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
                        <span>Publicado {formatDate(job.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(job.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Ver detalhes
                        </Button>
                        
                        {job.status === 'open' && !checkIfApplied(job.id) && (
                          <Button
                            size="sm"
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

                        {job.status !== 'open' && (
                          <Badge variant="outline" className="text-gray-500">
                            {job.status === 'completed' ? 'Concluído' : 'Não disponível'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FreelaFavorites;