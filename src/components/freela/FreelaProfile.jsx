import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Camera, MapPin, DollarSign, Star, Phone, Mail, Instagram, Globe, Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFreela } from '@/contexts/FreelaContext';

const FreelaProfile = () => {
  const { 
    profile, 
    portfolio, 
    updateProfile, 
    addPortfolioItem, 
    deletePortfolioItem, 
    uploadImage, 
    loading,
    categories,
    regions 
  } = useFreela();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

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

  const handleEdit = () => {
    setEditData({
      name: profile.name || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      categories: profile.categories || [],
      regions: profile.regions || [],
      hourly_rate: profile.hourly_rate || '',
      daily_rate: profile.daily_rate || '',
      project_rate: profile.project_rate || '',
      instagram_url: profile.instagram_url || '',
      website_url: profile.website_url || '',
      availability_status: profile.availability_status || 'available'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file, 'profiles/');
      await updateProfile({ profile_image_url: imageUrl });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPortfolio(true);
    try {
      const imageUrl = await uploadImage(file, 'portfolio/');
      await addPortfolioItem({
        image_url: imageUrl,
        title: 'Nova imagem',
        order_position: portfolio.length
      });
    } catch (error) {
      console.error('Erro ao fazer upload do portfólio:', error);
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const toggleCategory = (category) => {
    setEditData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleRegion = (region) => {
    setEditData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const formatCurrency = (value) => {
    if (!value) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profile_image_url} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {!uploadingImage ? (
                <label className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  {profile.rating?.toFixed(1) || '0.0'}
                </div>
                <span>{profile.total_jobs || 0} trabalhos</span>
                {profile.verified && (
                  <Badge variant="secondary">Verificado</Badge>
                )}
                <Badge 
                  variant={profile.availability_status === 'available' ? 'default' : 'secondary'}
                  className={profile.availability_status === 'available' ? 'bg-green-500' : ''}
                >
                  {profile.availability_status === 'available' ? 'Disponível' :
                   profile.availability_status === 'busy' ? 'Ocupado' : 'Indisponível'}
                </Badge>
              </div>
              
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Biografia</label>
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status de Disponibilidade</label>
              <Select 
                value={editData.availability_status} 
                onValueChange={(value) => setEditData(prev => ({ ...prev, availability_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="busy">Ocupado</SelectItem>
                  <SelectItem value="unavailable">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Especialidades</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={editData.categories?.includes(category) ? "default" : "outline"}
                    className="cursor-pointer text-center justify-center"
                    onClick={() => toggleCategory(category)}
                  >
                    {categoryLabels[category]}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Regiões de Atendimento</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {regions.map((region) => (
                  <Badge
                    key={region}
                    variant={editData.regions?.includes(region) ? "default" : "outline"}
                    className="cursor-pointer text-center justify-center text-xs"
                    onClick={() => toggleRegion(region)}
                  >
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valor/Hora (R$)</label>
                <Input
                  type="number"
                  value={editData.hourly_rate}
                  onChange={(e) => setEditData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Diária (R$)</label>
                <Input
                  type="number"
                  value={editData.daily_rate}
                  onChange={(e) => setEditData(prev => ({ ...prev, daily_rate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Projeto (R$)</label>
                <Input
                  type="number"
                  value={editData.project_rate}
                  onChange={(e) => setEditData(prev => ({ ...prev, project_rate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <Input
                  value={editData.instagram_url}
                  onChange={(e) => setEditData(prev => ({ ...prev, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site/Portfolio</label>
                <Input
                  value={editData.website_url}
                  onChange={(e) => setEditData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specialties & Regions */}
        <Card>
          <CardHeader>
            <CardTitle>Especialidades & Regiões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Especialidades</h4>
              <div className="flex flex-wrap gap-2">
                {profile.categories?.map((category) => (
                  <Badge key={category} variant="outline">
                    {categoryLabels[category] || category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Regiões de Atendimento</h4>
              <div className="flex flex-wrap gap-1">
                {profile.regions?.slice(0, 5).map((region) => (
                  <Badge key={region} variant="outline" className="text-xs">
                    {region}
                  </Badge>
                ))}
                {profile.regions?.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.regions.length - 5} mais
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Valores & Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">Por Hora</h4>
                <p className="text-lg font-semibold">{formatCurrency(profile.hourly_rate)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Diária</h4>
                <p className="text-lg font-semibold">{formatCurrency(profile.daily_rate)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Projeto</h4>
                <p className="text-lg font-semibold">{formatCurrency(profile.project_rate)}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              {profile.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${profile.phone}`} className="hover:text-blue-600">
                    {profile.phone}
                  </a>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${profile.email}`} className="hover:text-blue-600">
                  {profile.email}
                </a>
              </div>
              
              {profile.instagram_url && (
                <div className="flex items-center text-gray-600">
                  <Instagram className="w-4 h-4 mr-2" />
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    Instagram
                  </a>
                </div>
              )}
              
              {profile.website_url && (
                <div className="flex items-center text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    Website/Portfolio
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Portfolio
            <label className="cursor-pointer">
              <Button size="sm" disabled={uploadingPortfolio}>
                {uploadingPortfolio ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Adicionar Imagem
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handlePortfolioUpload}
                className="hidden"
              />
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio && portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePortfolioItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma imagem no portfólio ainda.</p>
              <p className="text-sm">Adicione imagens para mostrar seu trabalho!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelaProfile;