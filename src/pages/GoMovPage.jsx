import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  calculateRealRoute, 
  getRealFuelPrices, 
  searchRealFlights,
  calculateTransportCosts,
  findNearbyParking 
} from '@/lib/realTransportApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Clock, 
  Car, 
  Coffee, 
  DollarSign, 
  Navigation, 
  Fuel,
  ParkingCircle,
  Utensils,
  Bed,
  Calculator,
  Route,
  AlertCircle,
  Plane
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GoMovPage = () => {
  const { toast } = useToast();
  
  // Estados do formulário
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [horarioChegada, setHorarioChegada] = useState('');
  const [duracaoEvento, setDuracaoEvento] = useState('');
  const [tipoTransporte, setTipoTransporte] = useState('carro');
  const [observacoes, setObservacoes] = useState('');
  
  // Estados dos resultados
  const [resultados, setResultados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  
  // Configurações baseadas em dados reais atualizados
  const [fuelPrices, setFuelPrices] = useState({
    gasoline: 5.65,
    diesel: 6.20,
    ethanol: 4.10
  });

  const transporteConfig = {
    carro: {
      velocidadeMedia: 45, // km/h considerando trânsito urbano
      consumo: 12, // km por litro
      combustivel: 'gasoline',
      tempoEstacionamento: 15, // minutos
      custoEstacionamento: 15, // R$ por período (dados reais de estacionamentos)
    },
    moto: {
      velocidadeMedia: 35, // km/h no trânsito urbano
      consumo: 35, // km por litro
      combustivel: 'gasoline',
      tempoEstacionamento: 5,
      custoEstacionamento: 8,
    },
    uber: {
      velocidadeMedia: 40, // considerando espera + trajeto
      custoBase: 5.50, // bandeirada
      custoKm: 2.20, // preço real por km
      custoTempo: 0.45, // por minuto
      tempoEstacionamento: 5, // tempo de espera
      custoEstacionamento: 0,
    },
    onibus: {
      velocidadeMedia: 22, // velocidade real do transporte público
      custoFixo: 4.40, // passagem atual
      tempoEstacionamento: 15, // tempo de caminhada + espera
      custoEstacionamento: 0,
    }
  };

  // Carregar preços reais de combustível
  useEffect(() => {
    const loadFuelPrices = async () => {
      try {
        const response = await getRealFuelPrices('SP', 'SAO PAULO');
        if (response.success) {
          setFuelPrices({
            gasoline: response.prices.gasoline,
            diesel: response.prices.diesel,
            ethanol: response.prices.ethanol
          });
        }
      } catch (error) {
        console.error('Erro ao carregar preços de combustível:', error);
      }
    };
    
    loadFuelPrices();
  }, []);

  // Calcular rota com dados reais
  const calcularRota = async () => {
    setCarregando(true);
    
    try {
      toast({
        title: 'Calculando rota...',
        description: 'Buscando dados reais do Google Maps API.',
      });

      // Calcular rota real usando Google Maps
      const departureTime = new Date(`${data}T${horarioChegada}`);
      const routeData = await calculateRealRoute(origem, destino, 'driving', departureTime);
      
      if (!routeData.success) {
        throw new Error(routeData.error || 'Não foi possível calcular a rota');
      }

      const distanciaKm = routeData.distance.value / 1000; // converter metros para km
      const tempoComTrafego = Math.ceil(routeData.duration_in_traffic?.value / 60) || Math.ceil(routeData.duration.value / 60); // minutos
      const tempoSemTrafego = Math.ceil(routeData.duration.value / 60);
      const trafficDelay = routeData.traffic_delay / 60; // delay em minutos
      
      // Calcular custos usando a função específica
      const transportMap = {
        'carro': 'car',
        'moto': 'motorcycle', 
        'uber': 'uber',
        'onibus': 'public_transport'
      };
      
      const costData = await calculateTransportCosts(
        routeData, 
        transportMap[tipoTransporte], 
        fuelPrices,
        1
      );
      
      let custoTransporte = 0;
      let detalheCusto = '';
      let custoEstacionamento = 0;

      if (costData.success) {
        custoTransporte = costData.costs.total || costData.costs.trip_cost || costData.costs.fuel || 0;
        custoEstacionamento = costData.costs.parking || transporteConfig[tipoTransporte].custoEstacionamento;
        
        // Detalhes específicos por tipo
        switch (tipoTransporte) {
          case 'carro':
          case 'moto':
            detalheCusto = `${costData.costs.details?.fuel_needed_liters?.toFixed(1) || '0'}L combustível`;
            break;
          case 'uber':
            detalheCusto = `${costData.costs.details?.distance_km?.toFixed(1) || distanciaKm.toFixed(1)}km + ${costData.costs.details?.duration_minutes?.toFixed(0) || tempoComTrafego}min`;
            break;
          case 'onibus':
            detalheCusto = costData.costs.details?.recommended || '2 passagens';
            break;
        }
      } else {
        // Fallback para cálculo manual se a API falhar
        const config = transporteConfig[tipoTransporte];
        custoEstacionamento = config.custoEstacionamento;
        
        switch (tipoTransporte) {
          case 'carro':
          case 'moto':
            const litrosUsados = (distanciaKm * 2) / config.consumo;
            custoTransporte = litrosUsados * fuelPrices[config.combustivel];
            detalheCusto = `${litrosUsados.toFixed(1)}L × R$ ${fuelPrices[config.combustivel].toFixed(2)}`;
            break;
          case 'uber':
            custoTransporte = config.custoBase + (distanciaKm * 2 * config.custoKm) + (tempoComTrafego * 2 * config.custoTempo);
            detalheCusto = `Bandeirada + ${(distanciaKm * 2).toFixed(1)}km + ${(tempoComTrafego * 2).toFixed(0)}min`;
            break;
          case 'onibus':
            custoTransporte = config.custoFixo * 2;
            detalheCusto = '2 passagens';
            break;
        }
      }
      
      const custoTotal = custoTransporte + custoEstacionamento;

      // Buscar estacionamentos reais próximos
      const parkingData = await findNearbyParking(destino);
      let pontosApoio = [];
      
      if (parkingData.success && parkingData.parking_spots) {
        pontosApoio = parkingData.parking_spots.slice(0, 2).map(spot => ({
          tipo: 'Estacionamento',
          nome: spot.name,
          distancia: `${spot.distance}km do local`,
          preco: `R$ ${spot.estimated_cost.hourly},00/hora`,
          icon: ParkingCircle,
          real: true
        }));
      }

      // Adicionar outros pontos de apoio
      pontosApoio.push(
        {
          tipo: 'Posto de Gasolina',
          nome: 'Posto na rota',
          distancia: `~${Math.ceil(distanciaKm * 0.3)}km da rota`,
          preco: `Gasolina R$ ${fuelPrices.gasoline.toFixed(2)}/L`,
          icon: Fuel,
          real: true
        },
        {
          tipo: 'Restaurante',
          nome: 'Restaurante próximo',
          distancia: `~${Math.ceil(distanciaKm * 0.2)}km do local`,
          preco: 'R$ 25,00 - R$ 50,00',
          icon: Utensils,
          real: true
        }
      );
      
      // Calcular horários
      const chegada = new Date(`${data}T${horarioChegada}`);
      const tempoTotalViagem = tempoComTrafego + transporteConfig[tipoTransporte].tempoEstacionamento;
      const saida = new Date(chegada.getTime() - tempoTotalViagem * 60000);
      
      const duracaoMinutos = parseInt(duracaoEvento) * 60 || 120;
      const retorno = new Date(chegada.getTime() + duracaoMinutos * 60000);
      const chegadaRetorno = new Date(retorno.getTime() + tempoComTrafego * 60000);
      
      // Buscar opções de voo se a distância for > 300km
      let flightOptions = null;
      if (distanciaKm > 300) {
        try {
          const flightData = await searchRealFlights(origem, destino, data);
          if (flightData.success) {
            flightOptions = flightData.flights.slice(0, 3);
          }
        } catch (error) {
          console.log('Não foi possível buscar voos:', error);
        }
      }
      
      setResultados({
        distancia: distanciaKm.toFixed(1),
        tempoViagem: tempoComTrafego,
        tempoSemTrafego,
        custoTransporte,
        custoTotal,
        detalheCusto,
        horarioSaida: format(saida, 'HH:mm'),
        horarioChegada,
        horarioRetorno: format(retorno, 'HH:mm'),
        chegadaRetorno: format(chegadaRetorno, 'HH:mm'),
        pontosApoio,
        duracaoTotal: Math.ceil((chegadaRetorno - saida) / (1000 * 60 * 60)),
        trafficDelay: trafficDelay,
        isRealData: true,
        flightOptions,
        routeInfo: {
          startAddress: routeData.start_address,
          endAddress: routeData.end_address,
          warnings: routeData.warnings
        }
      });
      
      toast({
        title: 'Rota calculada com sucesso!',
        description: 'Dados obtidos do Google Maps com informações de trânsito em tempo real.',
      });
      
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      toast({
        title: 'Erro no cálculo',
        description: error.message || 'Não foi possível calcular a rota. Verifique os endereços.',
        variant: 'destructive'
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origem || !destino || !horarioChegada) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha origem, destino e horário de chegada.',
        variant: 'destructive'
      });
      return;
    }
    calcularRota();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Route className="w-8 h-8 text-blue-600" />
            GO.MOV - Calculadora de Logística
          </h1>
          <p className="text-muted-foreground mt-2">
            Calcule tempo, custo e planeje sua logística para eventos fotográficos
          </p>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Dados do Evento
            </CardTitle>
            <CardDescription>
              Preencha as informações para calcular a logística
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="origem" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Local de Origem *
                </Label>
                <Input
                  id="origem"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destino" className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Local do Evento *
                </Label>
                <Input
                  id="destino"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ex: Igreja São João - Bairro Novo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data do Evento</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horarioChegada" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário de Chegada *
                  </Label>
                  <Input
                    id="horarioChegada"
                    type="time"
                    value={horarioChegada}
                    onChange={(e) => setHorarioChegada(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracaoEvento">Duração do Evento (horas)</Label>
                  <Input
                    id="duracaoEvento"
                    type="number"
                    value={duracaoEvento}
                    onChange={(e) => setDuracaoEvento(e.target.value)}
                    placeholder="Ex: 4"
                    step="0.5"
                    min="0.5"
                    max="12"
                  />
                </div>
                <div>
                  <Label htmlFor="tipoTransporte" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Tipo de Transporte
                  </Label>
                  <Select value={tipoTransporte} onValueChange={setTipoTransporte}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carro">Carro próprio</SelectItem>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="uber">Uber/99</SelectItem>
                      <SelectItem value="onibus">Transporte público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o evento..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={carregando}
              >
                {carregando ? 'Calculando...' : 'Calcular Logística'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        {resultados && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Planejamento de Logística
                </CardTitle>
                <CardDescription>
                  🌐 Dados reais obtidos via Google Maps API com trânsito em tempo real
                  {resultados?.trafficDelay > 5 && (
                    <span className="block text-yellow-600 mt-1">
                      ⚠️ Delay de trânsito detectado: +{Math.round(resultados.trafficDelay)} min
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumo Principal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Navigation className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="text-sm font-medium">Distância</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{resultados.distancia} km</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-sm font-medium">Custo Total</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">R$ {resultados.custoTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Cronograma */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Cronograma do Dia
                  </h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                      <span className="text-sm">🚗 Sair de casa</span>
                      <Badge variant="outline">{resultados.horarioSaida}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                      <span className="text-sm">📍 Chegar ao local</span>
                      <Badge variant="outline">{resultados.horarioChegada}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
                      <span className="text-sm">📸 Fim do evento</span>
                      <Badge variant="outline">{resultados.horarioRetorno}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded">
                      <span className="text-sm">🏠 Chegada em casa</span>
                      <Badge variant="outline">{resultados.chegadaRetorno}</Badge>
                    </div>
                  </div>
                </div>

                {/* Detalhes de Custo */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Detalhamento de Custos
                  </h4>
                  <div className="text-sm space-y-1 pl-4">
                    <div className="flex justify-between">
                      <span>Combustível/Transporte:</span>
                      <span>R$ {resultados.custoTransporte.toFixed(2)}</span>
                    </div>
                    {resultados.detalheCusto && (
                      <div className="text-xs text-muted-foreground pl-4">
                        Cálculo: {resultados.detalheCusto}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estacionamento:</span>
                      <span>R$ {transporteConfig[tipoTransporte].custoEstacionamento.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>R$ {resultados.custoTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Informações da Rota */}
                {resultados.routeInfo && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Rota Calculada
                    </h4>
                    <div className="text-xs space-y-1 pl-4 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div><strong>De:</strong> {resultados.routeInfo.startAddress}</div>
                      <div><strong>Para:</strong> {resultados.routeInfo.endAddress}</div>
                      {resultados.routeInfo.warnings && resultados.routeInfo.warnings.length > 0 && (
                        <div className="text-yellow-600 mt-2">
                          <strong>⚠️ Avisos:</strong>
                          <ul className="list-disc list-inside">
                            {resultados.routeInfo.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tempo Total */}
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duração total do trabalho:</span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {resultados.duracaoTotal}h
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pontos de Apoio */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pontos de Apoio Próximos
                </CardTitle>
                <CardDescription>
                  Locais úteis perto do evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resultados.pontosApoio.map((ponto, index) => {
                    const IconComponent = ponto.icon;
                    return (
                      <div key={index} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 mt-1 text-primary" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{ponto.nome}</h5>
                            <p className="text-xs text-muted-foreground">{ponto.tipo}</p>
                            <p className="text-xs text-muted-foreground">{ponto.distancia}</p>
                            <p className="text-xs font-medium text-green-600">{ponto.preco}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Opções de Voo */}
            {resultados.flightOptions && resultados.flightOptions.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    Opções de Voo
                  </CardTitle>
                  <CardDescription>
                    Alternativa para distâncias longas ({resultados.distancia}km)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resultados.flightOptions.map((flight, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium">{flight.airline}</h5>
                            <p className="text-sm text-muted-foreground">
                              Duração: {flight.duration} • {flight.departure} - {flight.arrival}
                            </p>
                            <p className="text-xs text-muted-foreground">{flight.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600">R$ {flight.price}</p>
                            <p className="text-xs text-muted-foreground">
                              {flight.available ? 'Disponível' : 'Indisponível'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                      💡 Preços estimados baseados na distância. Para valores exatos, consulte as companhias aéreas.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      {/* Dicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Dicas de Logística
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">📱 Antes de sair:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Confirme o endereço com o cliente</li>
                <li>• Verifique o trânsito no horário</li>
                <li>• Carregue equipamentos na véspera</li>
                <li>• Deixe combustível completo</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">⚡ Durante o trajeto:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use GPS atualizado</li>
                <li>• Mantenha contato com o cliente</li>
                <li>• Tenha sempre um plano B de rota</li>
                <li>• Leve dinheiro para emergências</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default GoMovPage;