import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, MapPin, DollarSign, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFreela } from '@/contexts/FreelaContext';
import { useAuth } from '@/contexts/authContext';

const FreelaOnboarding = () => {
  const { user } = useAuth();
  const { createProfile, categories, regions, loading } = useFreela();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    bio: '',
    categories: [],
    regions: [],
    hourly_rate: '',
    daily_rate: '',
    project_rate: '',
    instagram_url: '',
    website_url: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleRegion = (region) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Remove campos vazios
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== '';
        })
      );

      // Converte rates para números
      if (cleanData.hourly_rate) cleanData.hourly_rate = parseFloat(cleanData.hourly_rate);
      if (cleanData.daily_rate) cleanData.daily_rate = parseFloat(cleanData.daily_rate);
      if (cleanData.project_rate) cleanData.project_rate = parseFloat(cleanData.project_rate);

      await createProfile(cleanData);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
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

  const stepValidation = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.bio.trim() !== '';
      case 2:
        return formData.categories.length > 0;
      case 3:
        return formData.regions.length > 0;
      case 4:
        return true; // Preços são opcionais
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-4">
              FREELA
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Crie seu perfil profissional
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Vamos configurar seu perfil para que você possa começar a encontrar trabalhos
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= num
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-gray-800 dark:text-white">
                {step === 1 && 'Informações Básicas'}
                {step === 2 && 'Suas Especialidades'}
                {step === 3 && 'Regiões de Atendimento'}
                {step === 4 && 'Valores e Links'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Nome Completo *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Telefone
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Biografia Profissional *
                    </label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Conte um pouco sobre sua experiência e especialidades..."
                      rows={4}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Categories */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                      Selecione suas especialidades *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={formData.categories.includes(category) ? "default" : "outline"}
                          className={`cursor-pointer p-3 text-center justify-center transition-all hover:scale-105 ${
                            formData.categories.includes(category)
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => toggleCategory(category)}
                        >
                          {categoryLabels[category] || category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Regions */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                      Selecione as regiões que você atende *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {regions.map((region) => (
                        <Badge
                          key={region}
                          variant={formData.regions.includes(region) ? "default" : "outline"}
                          className={`cursor-pointer p-2 text-center justify-center transition-all ${
                            formData.regions.includes(region)
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => toggleRegion(region)}
                        >
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Pricing & Links */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Valor por Hora (R$)
                      </label>
                      <Input
                        name="hourly_rate"
                        type="number"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Valor Diária (R$)
                      </label>
                      <Input
                        name="daily_rate"
                        type="number"
                        value={formData.daily_rate}
                        onChange={handleInputChange}
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Valor Projeto (R$)
                      </label>
                      <Input
                        name="project_rate"
                        type="number"
                        value={formData.project_rate}
                        onChange={handleInputChange}
                        placeholder="1500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Instagram
                    </label>
                    <Input
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/seuperfil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Site/Portfolio
                    </label>
                    <Input
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleInputChange}
                      placeholder="https://seusite.com"
                    />
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>

                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!stepValidation()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Finalizar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreelaOnboarding;