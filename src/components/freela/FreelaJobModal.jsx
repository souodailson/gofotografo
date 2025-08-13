import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, DollarSign, Clock, User, Building, Phone, Mail, Globe, Instagram, Users, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFreela } from '@/contexts/FreelaContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FreelaJobModal = ({ isOpen, onClose, job = null, readOnly = false }) => {
  const { 
    createJob, 
    updateJob, 
    loading, 
    categories, 
    regions, 
    paymentTypes, 
    urgencyLevels,
    toggleFavorite,
    checkIfFavorite 
  } = useFreela();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    region: '',
    job_date: '',
    job_time: '',
    duration_hours: '',
    budget_min: '',
    budget_max: '',
    payment_type: 'project',
    urgency: 'normal',
    requirements: '',
    equipment_provided: false,
    remote_work: false,
    contact_preference: 'platform'
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        location: job.location || '',
        region: job.region || '',
        job_date: job.job_date || '',
        job_time: job.job_time || '',
        duration_hours: job.duration_hours || '',
        budget_min: job.budget_min || '',
        budget_max: job.budget_max || '',
        payment_type: job.payment_type || 'project',
        urgency: job.urgency || 'normal',
        requirements: job.requirements || '',
        equipment_provided: job.equipment_provided || false,
        remote_work: job.remote_work || false,
        contact_preference: job.contact_preference || 'platform'
      });
    } else {
      // Reset form for new job
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        region: '',
        job_date: '',
        job_time: '',
        duration_hours: '',
        budget_min: '',
        budget_max: '',
        payment_type: 'project',
        urgency: 'normal',
        requirements: '',
        equipment_provided: false,
        remote_work: false,
        contact_preference: 'platform'
      });
    }
  }, [job, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert numeric fields
      const jobData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null
      };

      if (job) {
        await updateJob(job.id, jobData);
      } else {
        await createJob(jobData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar trabalho:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {readOnly ? 'Detalhes do Trabalho' : (job ? 'Editar Trabalho' : 'Publicar Novo Trabalho')}
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

        {readOnly && job ? (
          // Read-only view
          <div className="space-y-6">
            {/* Job Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={job.posted_by_profile?.profile_image_url} />
                  <AvatarFallback>
                    {job.posted_by_profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{job.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {job.posted_by_profile?.name}
                    </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(job.id)}
                  className={checkIfFavorite(job.id) ? 'text-red-500' : 'text-gray-500'}
                >
                  <Heart className={`w-4 h-4 ${checkIfFavorite(job.id) ? 'fill-current' : ''}`} />
                </Button>
                
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
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                </div>
                
                {job.requirements && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Requisitos</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Categoria</h4>
                    <Badge variant="outline">
                      {categoryLabels[job.category] || job.category}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Urgência</h4>
                    <Badge 
                      variant="outline"
                      className={`${urgencyLevels.find(u => u.value === job.urgency)?.color} text-white`}
                    >
                      {urgencyLevels.find(u => u.value === job.urgency)?.label}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Localização</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location} - {job.region}
                  </div>
                  {job.remote_work && (
                    <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                      Trabalho Remoto
                    </Badge>
                  )}
                </div>
                
                {job.job_date && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Data e Horário</h4>
                    <div className="flex items-center text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(job.job_date).toLocaleDateString('pt-BR')}
                      </div>
                      {job.job_time && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {job.job_time}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Orçamento</h4>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {job.budget_min && job.budget_max 
                      ? `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`
                      : formatCurrency(job.budget_min || job.budget_max)
                    }
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {paymentTypes.find(p => p.value === job.payment_type)?.label}
                  </p>
                </div>
                
                {job.duration_hours && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Duração Estimada</h4>
                    <p className="text-gray-600">{job.duration_hours} horas</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {job.equipment_provided && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Equipamento fornecido
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-4">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {job.posted_by_profile?.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${job.posted_by_profile.email}`} className="hover:text-blue-600">
                      {job.posted_by_profile.email}
                    </a>
                  </div>
                )}
                
                {job.posted_by_profile?.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${job.posted_by_profile.phone}`} className="hover:text-blue-600">
                      {job.posted_by_profile.phone}
                    </a>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  Preferência: {job.contact_preference === 'platform' ? 'Pela plataforma' : 
                              job.contact_preference === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Form view
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título do Trabalho *</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Fotógrafo para casamento em São Paulo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria *</label>
                  <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {categoryLabels[category] || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva detalhadamente o trabalho..."
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Requisitos</label>
                  <Textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Liste os requisitos necessários..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Local *</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo, SP"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Região *</label>
                    <Select onValueChange={(value) => handleSelectChange('region', value)} value={formData.region}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data do Trabalho</label>
                    <Input
                      type="date"
                      name="job_date"
                      value={formData.job_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Horário</label>
                    <Input
                      type="time"
                      name="job_time"
                      value={formData.job_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (horas)</label>
                  <Input
                    type="number"
                    name="duration_hours"
                    value={formData.duration_hours}
                    onChange={handleInputChange}
                    placeholder="Ex: 8"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Orçamento Mín. (R$)</label>
                    <Input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleInputChange}
                      placeholder="500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Orçamento Máx. (R$)</label>
                    <Input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleInputChange}
                      placeholder="1500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Pagamento</label>
                    <Select onValueChange={(value) => handleSelectChange('payment_type', value)} value={formData.payment_type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Urgência</label>
                    <Select onValueChange={(value) => handleSelectChange('urgency', value)} value={formData.urgency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="equipment_provided"
                      checked={formData.equipment_provided}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm">Equipamento será fornecido</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="remote_work"
                      checked={formData.remote_work}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm">Trabalho pode ser remoto</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Preferência de Contato</label>
                  <Select onValueChange={(value) => handleSelectChange('contact_preference', value)} value={formData.contact_preference}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Pela plataforma</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : null}
                {job ? 'Atualizar' : 'Publicar'} Trabalho
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FreelaJobModal;