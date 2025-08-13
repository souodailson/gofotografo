import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Eye,
  DollarSign,
  Star,
  Users,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Search,
  Plus,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RivalPage = () => {
  const { toast } = useToast();
  
  const [activeRegion, setActiveRegion] = useState('sao-paulo');
  const [selectedService, setSelectedService] = useState('casamento');
  const [myPrice, setMyPrice] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dados simulados de mercado
  const marketData = {
    'sao-paulo': {
      casamento: {
        averagePrice: 2800,
        minPrice: 1200,
        maxPrice: 8500,
        totalPhotographers: 342,
        marketGrowth: 12,
        competitionLevel: 'Alto',
        topCompetitors: [
          {
            name: 'Estúdio Premium SP',
            price: 4500,
            rating: 4.9,
            reviews: 284,
            specialties: ['Casamento', 'Ensaio'],
            differentials: ['Drone', 'Video 4K', 'Entrega 48h']
          },
          {
            name: 'Photo Wedding Dreams',
            price: 3200,
            rating: 4.7,
            reviews: 156,
            specialties: ['Casamento', 'Pre-wedding'],
            differentials: ['Álbum incluso', 'Maquiadora', '300 fotos']
          },
          {
            name: 'Momentos Eternos',
            price: 2100,
            rating: 4.5,
            reviews: 98,
            specialties: ['Casamento', 'Família'],
            differentials: ['Preço baixo', 'Pacote básico', 'Flexível']
          }
        ],
        priceDistribution: {
          'R$ 800-1500': 25,
          'R$ 1500-2500': 35,
          'R$ 2500-4000': 25,
          'R$ 4000+': 15
        },
        marketInsights: [
          'Mercado saturado com muitos profissionais',
          'Clientes valorizam portfólio e experiência',
          'Diferencial em serviços extras é importante',
          'Sazonalidade forte (mai-set)'
        ]
      },
      ensaio: {
        averagePrice: 350,
        minPrice: 150,
        maxPrice: 1200,
        totalPhotographers: 456,
        marketGrowth: 18,
        competitionLevel: 'Médio',
        topCompetitors: [
          {
            name: 'Ensaios SP',
            price: 450,
            rating: 4.8,
            reviews: 189,
            specialties: ['Ensaio Individual', 'Casal'],
            differentials: ['Locações exclusivas', '50 fotos', 'Make inclusa']
          }
        ],
        priceDistribution: {
          'R$ 100-250': 30,
          'R$ 250-400': 40,
          'R$ 400-600': 20,
          'R$ 600+': 10
        },
        marketInsights: [
          'Mercado em crescimento constante',
          'Redes sociais impulsionam demanda',
          'Público jovem e digital',
          'Locações urbanas em alta'
        ]
      }
    }
  };

  const regions = [
    { id: 'sao-paulo', name: 'São Paulo - SP' },
    { id: 'rio-janeiro', name: 'Rio de Janeiro - RJ' },
    { id: 'belo-horizonte', name: 'Belo Horizonte - MG' },
    { id: 'curitiba', name: 'Curitiba - PR' }
  ];

  const services = [
    { id: 'casamento', name: 'Casamento', icon: Camera },
    { id: 'ensaio', name: 'Ensaio', icon: Users },
    { id: 'corporativo', name: 'Corporativo', icon: Target },
    { id: 'evento', name: 'Eventos', icon: Star }
  ];

  const getCurrentMarketData = () => {
    return marketData[activeRegion]?.[selectedService] || marketData['sao-paulo']['casamento'];
  };

  const analyzeMyPosition = () => {
    if (!myPrice) {
      toast({
        title: 'Informe seu preço',
        description: 'Digite o valor do seu serviço para análise.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: 'Análise concluída!',
        description: 'Veja sua posição no mercado abaixo.',
      });
    }, 2000);
  };

  const getMyMarketPosition = () => {
    if (!myPrice) return null;
    
    const data = getCurrentMarketData();
    const price = parseFloat(myPrice);
    const avgPrice = data.averagePrice;
    
    let position = '';
    let color = '';
    let recommendation = '';
    
    if (price < avgPrice * 0.7) {
      position = 'Abaixo do mercado';
      color = 'text-red-600';
      recommendation = 'Considere aumentar seus preços gradually. Você pode estar desvalorizando seu trabalho.';
    } else if (price < avgPrice * 0.9) {
      position = 'Competitivo';
      color = 'text-yellow-600';
      recommendation = 'Posição boa para competir. Foque em diferenciais de qualidade.';
    } else if (price <= avgPrice * 1.1) {
      position = 'Na média do mercado';
      color = 'text-green-600';
      recommendation = 'Posição equilibrada. Mantenha qualidade e busque diferenciais únicos.';
    } else if (price <= avgPrice * 1.5) {
      position = 'Premium';
      color = 'text-blue-600';
      recommendation = 'Posição premium. Certifique-se de entregar valor excepcional.';
    } else {
      position = 'Muito acima do mercado';
      color = 'text-purple-600';
      recommendation = 'Preço muito alto. Avalie se seus diferenciais justificam o valor.';
    }
    
    return { position, color, recommendation, percentage: ((price / avgPrice) * 100).toFixed(0) };
  };

  const getCompetitionLevelColor = (level) => {
    switch (level) {
      case 'Alto': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'Médio': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Baixo': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const data = getCurrentMarketData();
  const myPosition = getMyMarketPosition();

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-foreground" />
            RIVAL - Radar de Concorrência e Mercado
          </h1>
          <p className="text-muted-foreground mt-2">
            Inteligência competitiva para posicionar seus serviços no mercado
          </p>
        </motion.div>

      {/* Configuração da Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Configure sua Análise
          </CardTitle>
          <CardDescription>
            Defina região, serviço e seu preço atual para análise personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Região</label>
              <select 
                className="w-full p-2 border rounded-lg bg-background mt-1"
                value={activeRegion}
                onChange={(e) => setActiveRegion(e.target.value)}
              >
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Serviço</label>
              <select 
                className="w-full p-2 border rounded-lg bg-background mt-1"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Seu Preço (R$)</label>
              <Input
                type="number"
                value={myPrice}
                onChange={(e) => setMyPrice(e.target.value)}
                placeholder="Ex: 2500"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={analyzeMyPosition} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? 'Analisando...' : 'Analisar Posição'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visão Geral do Mercado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold text-green-600">R$ {data.averagePrice.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fotógrafos</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalPhotographers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-2xl font-bold text-purple-600">+{data.marketGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competição</p>
                <Badge className={getCompetitionLevelColor(data.competitionLevel)}>
                  {data.competitionLevel}
                </Badge>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minha Posição no Mercado */}
      {myPosition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Sua Posição no Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`text-3xl font-bold ${myPosition.color}`}>
                      {myPosition.percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">da média do mercado</p>
                  </div>
                  <Badge className={myPosition.color.replace('text-', 'bg-').replace('-600', '-100') + ' dark:bg-opacity-20'}>
                    {myPosition.position}
                  </Badge>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Recomendação Estratégica
                  </h4>
                  <p className="text-sm text-muted-foreground bg-accent p-3 rounded-lg">
                    {myPosition.recommendation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Preços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição de Preços
            </CardTitle>
            <CardDescription>
              Como os fotógrafos precificam no mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.priceDistribution).map(([range, percentage]) => (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{range}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights do Mercado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Insights do Mercado
            </CardTitle>
            <CardDescription>
              Tendências e oportunidades identificadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.marketInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Principais Concorrentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Principais Concorrentes
          </CardTitle>
          <CardDescription>
            Análise dos fotógrafos de destaque na sua região
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topCompetitors.map((competitor, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{competitor.name}</h4>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(competitor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {competitor.rating} ({competitor.reviews} avaliações)
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-green-600">
                      R$ {competitor.price.toLocaleString()}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Diferenciais:</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.differentials.map((diff, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {diff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Ações Estratégicas Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">🎯 Posicionamento:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Defina seus diferenciais únicos</li>
                <li>• Aumente presença digital e portfólio</li>
                <li>• Colete mais avaliações positivas</li>
                <li>• Especialize-se em nichos específicos</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">💰 Precificação:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Monitore preços regularmente</li>
                <li>• Crie pacotes com diferentes valores</li>
                <li>• Justifique preços com qualidade</li>
                <li>• Considere sazonalidade nos preços</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default RivalPage;