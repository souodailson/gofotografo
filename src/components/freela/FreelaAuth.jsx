import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Users, MapPin, Star, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/authContext';
import { useToast } from '@/components/ui/use-toast';

const FreelaAuth = ({ onAuthSuccess }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(formData.email, formData.password);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao FREELA!"
      });
      onAuthSuccess();
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone
      });
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar a conta."
      });
      onAuthSuccess();
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Camera,
      title: "Encontre Freelancers",
      description: "Fotógrafos, filmmakers, editores e mais profissionais do audiovisual"
    },
    {
      icon: MapPin,
      title: "Trabalhos por Região",
      description: "Encontre oportunidades próximas a você ou ofereça seus serviços"
    },
    {
      icon: Users,
      title: "Rede de Profissionais",
      description: "Conecte-se com outros profissionais e expanda sua rede de contatos"
    },
    {
      icon: Star,
      title: "Sistema de Avaliações",
      description: "Construa sua reputação com avaliações de clientes satisfeitos"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-4">
              FREELA
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Encontre freela para seus trabalhos em tempo real
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ou encontre trabalhos próximos a você em tempo real
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Por que escolher o FREELA?
              </h3>
              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  Entre ou Cadastre-se
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          name="password"
                          placeholder="Senha"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            Entrar <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          name="name"
                          placeholder="Nome completo"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="Telefone (opcional)"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          name="password"
                          placeholder="Senha"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            Cadastrar <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">1000+</div>
              <div className="text-gray-600 dark:text-gray-300">Freelancers Ativos</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Trabalhos Publicados</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">98%</div>
              <div className="text-gray-600 dark:text-gray-300">Satisfação dos Clientes</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelaAuth;