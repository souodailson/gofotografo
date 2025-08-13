import React from 'react';
import { Camera, Users, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FindPageSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
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
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
            ].map((feature, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg mx-auto mb-4 w-fit">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg">
            Em Desenvolvimento
          </Button>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Sistema FREELA em construção. Em breve disponível!
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">1000+</div>
              <div className="text-gray-600 dark:text-gray-300">Freelancers Esperados</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Trabalhos Previstos</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">98%</div>
              <div className="text-gray-600 dark:text-gray-300">Expectativa de Satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindPageSimple;