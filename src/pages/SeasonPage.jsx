import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Star, 
  Heart, 
  Gift, 
  Sparkles,
  Moon,
  Sun,
  Snowflake,
  Flower,
  Copy,
  Share2,
  TrendingUp,
  Camera,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays, startOfYear, endOfYear, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SeasonPage = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customCampaign, setCustomCampaign] = useState('');

  const currentYear = new Date().getFullYear();

  // Eventos pré-carregados do calendário sazonal
  const eventosCalendario = [
    // Janeiro
    {
      id: 'jan1',
      name: 'Ano Novo',
      date: `${currentYear}-01-01`,
      month: 0,
      type: 'comercial',
      icon: Sparkles,
      color: 'bg-purple-100 dark:bg-purple-900',
      campaign: {
        name: 'Ensaio Resolução de Ano Novo',
        description: 'Capture o novo começo e as metas do ano',
        text: '✨ Novo ano, nova versão de você! Que tal registrar essa transformação com um ensaio especial? Sessões de 2024 já abertas! #AnoNovo #NovoEu #GoFotografo',
        discount: '20% OFF até 15/01',
        package: 'Ensaio Individual + 10 fotos editadas',
        price: 'A partir de R$ 200'
      }
    },
    {
      id: 'jan2',
      name: 'Carnaval 2024',
      date: `${currentYear}-02-12`,
      month: 1,
      type: 'cultural',
      icon: Star,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      campaign: {
        name: 'Ensaio Carnavalesco',
        description: 'Cores, alegria e fantasia em um ensaio único',
        text: '🎭 Que tal eternizar a alegria do Carnaval? Ensaios temáticos com fantasias incríveis e muita cor! Agende já o seu! #Carnaval #Fantasia #Cores',
        discount: '15% OFF para grupos',
        package: 'Ensaio Temático + 15 fotos',
        price: 'A partir de R$ 300'
      }
    },
    // Março
    {
      id: 'mar1',
      name: 'Dia da Mulher',
      date: `${currentYear}-03-08`,
      month: 2,
      type: 'comercial',
      icon: Heart,
      color: 'bg-pink-100 dark:bg-pink-900',
      campaign: {
        name: 'Ensaio Empoderamento Feminino',
        description: 'Celebre a força e beleza da mulher',
        text: '👑 Março é o mês da mulher! Que tal um ensaio que celebre sua força e beleza? Você merece! #DiaDaMulher #Empoderamento #MulherFotografa',
        discount: '25% OFF durante todo março',
        package: 'Ensaio Feminino + Make + 20 fotos',
        price: 'A partir de R$ 350'
      }
    },
    {
      id: 'mar2',
      name: 'Outono',
      date: `${currentYear}-03-20`,
      month: 2,
      type: 'sazonal',
      icon: Flower,
      color: 'bg-orange-100 dark:bg-orange-900',
      campaign: {
        name: 'Ensaio Outono Dourado',
        description: 'Tons quentes e luz dourada do outono',
        text: '🍂 O outono chegou com suas cores mágicas! Ensaios ao ar livre aproveitando a luz dourada da estação. #Outono #LuzDourada #Natureza',
        discount: '10% OFF em ensaios externos',
        package: 'Ensaio Externo + 12 fotos',
        price: 'A partir de R$ 250'
      }
    },
    // Abril
    {
      id: 'abr1',
      name: 'Páscoa',
      date: `${currentYear}-03-31`,
      month: 2,
      type: 'comercial',
      icon: Gift,
      color: 'bg-green-100 dark:bg-green-900',
      campaign: {
        name: 'Ensaio Família Páscoa',
        description: 'Momentos especiais em família na Páscoa',
        text: '🐰 Páscoa é tempo de união! Ensaios em família com decoração temática. Momentos doces para guardar para sempre! #Pascoa #Familia #Momentos',
        discount: '20% OFF para famílias',
        package: 'Ensaio Família + 25 fotos',
        price: 'A partir de R$ 400'
      }
    },
    // Maio
    {
      id: 'mai1',
      name: 'Dia das Mães',
      date: `${currentYear}-05-12`,
      month: 4,
      type: 'comercial',
      icon: Heart,
      color: 'bg-rose-100 dark:bg-rose-900',
      campaign: {
        name: 'Ensaio Dia das Mães',
        description: 'Homenagem especial para as mães',
        text: '💝 Mãe é só uma! Que tal presentear com um ensaio especial? Registre todo amor em imagens inesquecíveis! #DiaDasMaes #MaeEspecial #Amor',
        discount: '30% OFF até 10/05',
        package: 'Ensaio Mãe e Filhos + 20 fotos',
        price: 'A partir de R$ 280'
      }
    },
    // Junho
    {
      id: 'jun1',
      name: 'Festa Junina',
      date: `${currentYear}-06-24`,
      month: 5,
      type: 'cultural',
      icon: Star,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      campaign: {
        name: 'Ensaio Junino',
        description: 'Tradição e diversão nos ensaios juninos',
        text: '🌽 Arraial chegando! Ensaios temáticos juninos cheios de cor e tradição. Venha com seu look caipira! #FestaJunina #Tradicao #Caipira',
        discount: '15% OFF para casais',
        package: 'Ensaio Temático + 15 fotos',
        price: 'A partir de R$ 250'
      }
    },
    {
      id: 'jun2',
      name: 'Inverno',
      date: `${currentYear}-06-21`,
      month: 5,
      type: 'sazonal',
      icon: Snowflake,
      color: 'bg-blue-100 dark:bg-blue-900',
      campaign: {
        name: 'Ensaio Inverno Aconchegante',
        description: 'Aconchego e intimidade do inverno',
        text: '❄️ Inverno chegou! Ensaios internos aconchegantes ou externos com looks de frio. Luz suave e clima intimista! #Inverno #Aconchego #Intimista',
        discount: '10% OFF em estúdio',
        package: 'Ensaio Estúdio + 12 fotos',
        price: 'A partir de R$ 300'
      }
    },
    // Agosto
    {
      id: 'ago1',
      name: 'Dia dos Pais',
      date: `${currentYear}-08-11`,
      month: 7,
      type: 'comercial',
      icon: Heart,
      color: 'bg-blue-100 dark:bg-blue-900',
      campaign: {
        name: 'Ensaio Dia dos Pais',
        description: 'Celebrando a paternidade com carinho',
        text: '👨‍👧‍👦 Pai é herói de todo dia! Ensaio especial celebrando a paternidade. Momentos únicos entre pais e filhos! #DiaDoPai #Paternidade #Heroi',
        discount: '25% OFF até 09/08',
        package: 'Ensaio Pai e Filhos + 18 fotos',
        price: 'A partir de R$ 270'
      }
    },
    // Setembro
    {
      id: 'set1',
      name: 'Primavera',
      date: `${currentYear}-09-22`,
      month: 8,
      type: 'sazonal',
      icon: Flower,
      color: 'bg-green-100 dark:bg-green-900',
      campaign: {
        name: 'Ensaio Primavera Florido',
        description: 'Renascimento e cores da primavera',
        text: '🌸 Primavera chegou com tudo! Ensaios externos entre flores e cores vibrantes. Tempo de renovar! #Primavera #Flores #Renovacao',
        discount: '15% OFF em externos',
        package: 'Ensaio Externo + 15 fotos',
        price: 'A partir de R$ 280'
      }
    },
    // Outubro
    {
      id: 'out1',
      name: 'Halloween',
      date: `${currentYear}-10-31`,
      month: 9,
      type: 'cultural',
      icon: Star,
      color: 'bg-orange-100 dark:bg-orange-900',
      campaign: {
        name: 'Ensaio Halloween',
        description: 'Diversão e criatividade no Halloween',
        text: '🎃 Halloween chegando! Ensaios criativos e divertidos com fantasias incríveis. Solte a imaginação! #Halloween #Fantasia #Criativo',
        discount: '20% OFF para grupos',
        package: 'Ensaio Temático + 20 fotos',
        price: 'A partir de R$ 320'
      }
    },
    {
      id: 'out2',
      name: 'Dia das Crianças',
      date: `${currentYear}-10-12`,
      month: 9,
      type: 'comercial',
      icon: Gift,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      campaign: {
        name: 'Ensaio Dia das Crianças',
        description: 'Diversão e inocência infantil',
        text: '🧸 Dia das Crianças especial! Ensaios lúdicos e divertidos. Capture a magia da infância! #DiaDasCriancas #Infancia #Diversao',
        discount: '30% OFF até 10/10',
        package: 'Ensaio Infantil + 25 fotos',
        price: 'A partir de R$ 200'
      }
    },
    // Dezembro
    {
      id: 'dez1',
      name: 'Natal',
      date: `${currentYear}-12-25`,
      month: 11,
      type: 'comercial',
      icon: Gift,
      color: 'bg-red-100 dark:bg-red-900',
      campaign: {
        name: 'Ensaio Natalino',
        description: 'Magia e união do Natal em família',
        text: '🎄 Natal é tempo de união! Ensaios natalinos em família com toda decoração mágica da época! #Natal #Familia #Magia',
        discount: '25% OFF dezembro todo',
        package: 'Ensaio Natalino + 30 fotos',
        price: 'A partir de R$ 450'
      }
    },
    {
      id: 'dez2',
      name: 'Verão',
      date: `${currentYear}-12-21`,
      month: 11,
      type: 'sazonal',
      icon: Sun,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      campaign: {
        name: 'Ensaio Verão Vibrante',
        description: 'Energia e alegria do verão',
        text: '☀️ Verão chegou com toda energia! Ensaios externos vibrantes, praia, piscina e muita cor! #Verao #Praia #Energia',
        discount: '15% OFF em ensaios externos',
        package: 'Ensaio Verão + 18 fotos',
        price: 'A partir de R$ 350'
      }
    }
  ];

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEventosDoMes = (month) => {
    return eventosCalendario.filter(evento => evento.month === month);
  };

  const gerarPostRedesSociais = (evento) => {
    const post = `${evento.campaign.text}

💰 OFERTA ESPECIAL: ${evento.campaign.discount}
📦 ${evento.campaign.package}
💵 ${evento.campaign.price}

📞 Agende já: (seu telefone)
📍 (seu endereço)

#fotografia #ensaio #${evento.name.replace(/\s+/g, '').toLowerCase()}
${customCampaign ? `\n\n${customCampaign}` : ''}`;

    navigator.clipboard.writeText(post);
    toast({
      title: 'Post copiado!',
      description: 'O texto para redes sociais foi copiado para sua área de transferência.',
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'comercial': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cultural': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'sazonal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'comercial': return 'Data Comercial';
      case 'cultural': return 'Evento Cultural';
      case 'sazonal': return 'Estação do Ano';
      default: return 'Outro';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <CalendarIcon className="w-8 h-8 text-yellow-600" />
            SEASON - Planejador Sazonal
          </h1>
          <p className="text-muted-foreground mt-2">
            Calendário inteligente com eventos fotogênicos e campanhas prontas
          </p>
        </motion.div>

      {/* Navegação por Meses */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {meses.map((mes, index) => {
              const eventosCount = getEventosDoMes(index).length;
              return (
                <Button
                  key={index}
                  variant={selectedMonth === index ? 'default' : 'outline'}
                  onClick={() => setSelectedMonth(index)}
                  className="relative"
                >
                  {mes}
                  {eventosCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                      {eventosCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Eventos do Mês Selecionado */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Eventos de {meses[selectedMonth]} {currentYear}
        </h2>
        
        {getEventosDoMes(selectedMonth).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Nenhum evento encontrado
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Este mês não possui eventos pré-cadastrados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getEventosDoMes(selectedMonth).map((evento) => {
              const IconComponent = evento.icon;
              return (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${evento.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{evento.name}</CardTitle>
                            <CardDescription>
                              {format(parseISO(evento.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getTypeColor(evento.type)}>
                          {getTypeLabel(evento.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">{evento.campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{evento.campaign.description}</p>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">{evento.campaign.discount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-3 h-3" />
                          <span>{evento.campaign.package}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          <span>{evento.campaign.price}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedEvent(evento)}
                        className="w-full"
                        size="sm"
                      >
                        Ver Campanha Completa
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Campanha */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${selectedEvent.color}`}>
                    <selectedEvent.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEvent.campaign.name}</h2>
                    <p className="text-muted-foreground">{selectedEvent.name} - {format(parseISO(selectedEvent.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descrição da Campanha</h3>
                  <p className="text-muted-foreground">{selectedEvent.campaign.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Oferta Especial
                    </h4>
                    <p className="text-sm">{selectedEvent.campaign.discount}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Pacote Sugerido
                    </h4>
                    <p className="text-sm">{selectedEvent.campaign.package}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Texto para Redes Sociais
                  </h4>
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-sm whitespace-pre-line">{selectedEvent.campaign.text}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Personalizar Campanha</h4>
                  <Textarea
                    placeholder="Adicione observações personalizadas à sua campanha..."
                    value={customCampaign}
                    onChange={(e) => setCustomCampaign(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => gerarPostRedesSociais(selectedEvent)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Post Completo
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Dicas Sazonais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Dicas para Campanhas Sazonais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">📅 Planejamento:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Divulgue campanhas com 2-3 semanas de antecedência</li>
                <li>• Prepare props e cenários temáticos</li>
                <li>• Agende horários extras para demanda alta</li>
                <li>• Crie pacotes especiais para cada data</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">💰 Precificação:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ofereça descontos para reservas antecipadas</li>
                <li>• Crie pacotes família para datas comemorativas</li>
                <li>• Estabeleça preços premium para alta demanda</li>
                <li>• Considere combos com produtos impressos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default SeasonPage;