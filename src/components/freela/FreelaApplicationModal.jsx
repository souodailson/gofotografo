import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Clock, Send, User, Briefcase, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFreela } from '@/contexts/FreelaContext';

const FreelaApplicationModal = ({ isOpen, onClose, job }) => {
  const { createApplication, loading, profile, portfolio } = useFreela();
  
  const [formData, setFormData] = useState({
    message: '',
    proposed_rate: '',
    estimated_hours: '',
    portfolio_samples: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePortfolioSample = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      portfolio_samples: prev.portfolio_samples.includes(imageUrl)
        ? prev.portfolio_samples.filter(url => url !== imageUrl)
        : [...prev.portfolio_samples, imageUrl]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!job) return;
    
    try {
      const applicationData = {
        job_id: job.id,
        message: formData.message,
        proposed_rate: formData.proposed_rate ? parseFloat(formData.proposed_rate) : null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        portfolio_samples: formData.portfolio_samples
      };

      await createApplication(applicationData);
      
      // Reset form
      setFormData({
        message: '',
        proposed_rate: '',
        estimated_hours: '',
        portfolio_samples: []
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Send className="w-5 h-5 text-purple-500" />
              Candidatar-se ao Trabalho
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{job.location}</span>
              <span>•</span>
              <span>
                {job.budget_min && job.budget_max 
                  ? `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`
                  : formatCurrency(job.budget_min || job.budget_max)
                }
              </span>
              {job.duration_hours && (
                <>
                  <span>•</span>
                  <span>{job.duration_hours}h estimadas</span>
                </>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="border-b pb-4">
            <h4 className="font-medium mb-3">Seu Perfil</h4>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={profile?.profile_image_url} />
                <AvatarFallback>
                  {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{profile?.name}</div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{profile?.rating?.toFixed(1) || '0.0'}</span>
                  <span>•</span>
                  <span>{profile?.total_jobs || 0} trabalhos</span>
                  {profile?.verified && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">Verificado</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mensagem de Apresentação *
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Apresente-se e explique por que você é o profissional ideal para este trabalho..."
                rows={5}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Destaque sua experiência relevante e diferenciais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Valor Proposto (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    name="proposed_rate"
                    value={formData.proposed_rate}
                    onChange={handleInputChange}
                    placeholder="1500"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seu valor para este trabalho
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tempo Estimado (horas)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleInputChange}
                    placeholder="8"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Quantas horas você levaria
                </p>
              </div>
            </div>

            {/* Portfolio Samples */}
            {portfolio && portfolio.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Amostras do Portfólio (opcional)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {portfolio.map((item) => (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        formData.portfolio_samples.includes(item.image_url)
                          ? 'border-purple-500 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePortfolioSample(item.image_url)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-20 object-cover"
                      />
                      {formData.portfolio_samples.includes(item.image_url) && (
                        <div className="absolute inset-0 bg-purple-500 bg-opacity-50 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selecione até 4 imagens que demonstrem sua experiência para este tipo de trabalho
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.message.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Candidatura
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Dicas para uma boa candidatura:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Seja específico sobre sua experiência relevante</li>
              <li>• Demonstre que entendeu os requisitos do trabalho</li>
              <li>• Inclua amostras do seu portfólio relacionadas ao projeto</li>
              <li>• Seja realista com prazos e valores</li>
              <li>• Mantenha um tom profissional e cordial</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreelaApplicationModal;