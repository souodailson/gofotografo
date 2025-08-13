import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar,
  TrendingUp,
  Zap,
  Star,
  Clock,
  Users,
  DollarSign,
  Camera,
  AlertTriangle,
  CheckCircle,
  Eye,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Compass,
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays, parseISO, isBefore, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OpportunePage = () => {
  const { toast } = useToast();
  
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const [filtroRegiao, setFiltroRegiao] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunidadesSelecionadas, setOpportunidadesSelecionadas] = useState([]);

  // Base de dados de oportunidades (normalmente viria de APIs externas)
  const oportunidades = [
    {
      id: 'opp1',
      titulo: 'Festival de Inverno Campos do Jordão',
      categoria: 'evento',
      descricao: 'Festival anual com música clássica, movimento turístico intenso',
      local: 'Campos do Jordão - SP',
      dataInicio: '2024-07-15',
      dataFim: '2024-07-30',
      prioridade: 'alta',
      potencialReceita: 'R$ 5.000 - R$ 15.000',
      audienciaEstimada: 50000,
      competicaoNivel: 'médio',
      dificuldadeAcesso: 'fácil',
      tipoOportunidade: 'Cobertura de evento + ensaios turísticos',
      requisitos: ['Equipamento portátil', 'Autorização para evento'],
      dicas: [
        'Contatar organizadores 2 meses antes',
        'Oferecer pacotes para turistas',
        'Focar em ensaios ao ar livre com paisagem'
      ],
      tendencia: 'crescendo',
      ultimaAtualizacao: '2024-01-15',
      fonte: 'Calendário de eventos municipais'
    },
    {
      id: 'opp2',
      titulo: 'Corrida São Silvestre',
      categoria: 'evento-esportivo',
      descricao: 'Corrida tradicional de fim de ano, milhares de participantes',
      local: 'São Paulo - SP',
      dataInicio: '2024-12-31',
      dataFim: '2024-12-31',
      prioridade: 'muito-alta',
      potencialReceita: 'R$ 2.000 - R$ 8.000',
      audienciaEstimada: 25000,
      competicaoNivel: 'alto',
      dificuldadeAcesso: 'médio',
      tipoOportunidade: 'Fotos de chegada + ensaios fitness',
      requisitos: ['Credencial de imprensa', 'Teleobjetiva'],
      dicas: [
        'Posicionar-se na linha de chegada',
        'Oferecer fotos instantâneas',
        'Criar campanha pré-evento para corredores'
      ],
      tendencia: 'estável',
      ultimaAtualizacao: '2024-01-10',
      fonte: 'Eventos esportivos'
    },
    {
      id: 'opp3',
      titulo: 'Lua Cheia de Maio',
      categoria: 'natural',
      descricao: 'Superlua com condições ideais para fotografia noturna',
      local: 'Região Metropolitana - SP',
      dataInicio: '2024-05-23',
      dataFim: '2024-05-25',
      prioridade: 'alta',
      potencialReceita: 'R$ 800 - R$ 3.000',
      audienciaEstimada: 1000,
      competicaoNivel: 'baixo',
      dificuldadeAcesso: 'fácil',
      tipoOportunidade: 'Ensaios noturnos temáticos',
      requisitos: ['Tripé', 'Conhecimento fotografia noturna'],
      dicas: [
        'Divulgar com 1 semana de antecedência',
        'Escolher locais com vista desobstruída',
        'Oferecer workshops de fotografia noturna'
      ],
      tendencia: 'crescendo',
      ultimaAtualizacao: '2024-01-12',
      fonte: 'Calendário astronômico'
    },
    {
      id: 'opp4',
      titulo: 'Feriado Prolongado de Junho',
      categoria: 'temporal',
      descricao: 'Feriado de Corpus Christi cria final de semana de 4 dias',
      local: 'Interior - SP',
      dataInicio: '2024-06-01',
      dataFim: '2024-06-04',
      prioridade: 'média',
      potencialReceita: 'R$ 1.500 - R$ 6.000',
      audienciaEstimada: 5000,
      competicaoNivel: 'médio',
      dificuldadeAcesso: 'fácil',
      tipoOportunidade: 'Ensaios familiares + mini-wedding',
      requisitos: ['Disponibilidade no feriado'],
      dicas: [
        'Criar pacotes especiais para feriado',
        'Aproveitar movimento turístico',
        'Parcerias com pousadas e hotéis'
      ],
      tendencia: 'estável',
      ultimaAtualizacao: '2024-01-08',
      fonte: 'Calendário oficial'
    },
    {
      id: 'opp5',
      titulo: 'Inauguração Shopping Vila Olímpia',
      categoria: 'comercial',
      descricao: 'Abertura de novo shopping center, evento com celebridades',
      local: 'Vila Olímpia - São Paulo',
      dataInicio: '2024-03-20',
      dataFim: '2024-03-22',
      prioridade: 'alta',
      potencialReceita: 'R$ 3.000 - R$ 10.000',
      audienciaEstimada: 15000,
      competicaoNivel: 'alto',
      dificuldadeAcesso: 'difícil',
      tipoOportunidade: 'Cobertura comercial + ensaios corporativos',
      requisitos: ['Portfólio corporativo', 'Credencial'],
      dicas: [
        'Contatar assessoria do shopping',
        'Propor cobertura das lojas',
        'Networking com lojistas'
      ],
      tendencia: 'crescendo',
      ultimaAtualizacao: '2024-01-20',
      fonte: 'Notícias comerciais'
    }
  ];

  const categorias = [
    { id: 'todos', name: 'Todas', count: oportunidades.length },
    { id: 'evento', name: 'Eventos', count: oportunidades.filter(o => o.categoria === 'evento').length },
    { id: 'evento-esportivo', name: 'Esportivos', count: oportunidades.filter(o => o.categoria === 'evento-esportivo').length },
    { id: 'natural', name: 'Fenômenos Naturais', count: oportunidades.filter(o => o.categoria === 'natural').length },
    { id: 'temporal', name: 'Sazonais', count: oportunidades.filter(o => o.categoria === 'temporal').length },
    { id: 'comercial', name: 'Comerciais', count: oportunidades.filter(o => o.categoria === 'comercial').length }
  ];

  const prioridades = [
    { id: 'todos', name: 'Todas' },
    { id: 'muito-alta', name: 'Muito Alta', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { id: 'alta', name: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { id: 'média', name: 'Média', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { id: 'baixa', name: 'Baixa', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  ];

  const getOportunidadesFiltradas = () => {
    let filtradas = oportunidades;

    if (filtroCategoria !== 'todos') {
      filtradas = filtradas.filter(opp => opp.categoria === filtroCategoria);
    }

    if (filtroPrioridade !== 'todos') {
      filtradas = filtradas.filter(opp => opp.prioridade === filtroPrioridade);
    }

    if (searchTerm) {
      filtradas = filtradas.filter(opp =>
        opp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.local.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtradas.sort((a, b) => {
      const prioridadeOrder = { 'muito-alta': 4, 'alta': 3, 'média': 2, 'baixa': 1 };
      return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    });
  };

  const getPrioridadeCor = (prioridade) => {
    const prio = prioridades.find(p => p.id === prioridade);
    return prio?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getDiasRestantes = (dataInicio) => {
    const hoje = new Date();
    const inicio = parseISO(dataInicio);
    return differenceInDays(inicio, hoje);
  };

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'crescendo': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declinando': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const adicionarAoPlano = (oportunidade) => {
    if (!opportunidadesSelecionadas.find(o => o.id === oportunidade.id)) {
      setOpportunidadesSelecionadas([...opportunidadesSelecionadas, oportunidade]);
      toast({
        title: 'Oportunidade adicionada!',
        description: `${oportunidade.titulo} foi adicionada ao seu plano de ação.`,
      });
    }
  };

  const removerDoPlano = (id) => {
    setOpportunidadesSelecionadas(opportunidadesSelecionadas.filter(o => o.id !== id));
    toast({
      title: 'Oportunidade removida',
      description: 'Item removido do seu plano de ação.',
    });
  };

  const criarCampanhaAutomatica = (oportunidade) => {
    const campanha = `🎯 OPORTUNIDADE DETECTADA: ${oportunidade.titulo}

📅 Data: ${format(parseISO(oportunidade.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
📍 Local: ${oportunidade.local}
👥 Público estimado: ${oportunidade.audienciaEstimada.toLocaleString()} pessoas
💰 Potencial: ${oportunidade.potencialReceita}

${oportunidade.tipoOportunidade}

📸 Aproveite esta oportunidade única!
📱 Agende já seu ensaio: (seu telefone)

#fotografia #oportunidade #${oportunidade.categoria}`;

    navigator.clipboard.writeText(campanha);
    toast({
      title: 'Campanha criada!',
      description: 'Texto da campanha copiado para área de transferência.',
    });
  };

  const filtradas = getOportunidadesFiltradas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 text-purple-600" />
            OPPORTUNE - Mapa de Oportunidades
          </h1>
          <p className="text-muted-foreground mt-2">
            Inteligência para detectar oportunidades fotográficas automáticas
          </p>
        </motion.div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{oportunidades.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">
                  {oportunidades.filter(o => o.prioridade === 'muito-alta' || o.prioridade === 'alta').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Meu Plano</p>
                <p className="text-2xl font-bold text-green-600">{opportunidadesSelecionadas.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potencial Total</p>
                <p className="text-2xl font-bold text-purple-600">R$ 50K+</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar oportunidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias.map((categoria) => (
                <Button
                  key={categoria.id}
                  variant={filtroCategoria === categoria.id ? 'default' : 'outline'}
                  onClick={() => setFiltroCategoria(categoria.id)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {categoria.name}
                  <Badge variant="secondary" className="text-xs">
                    {categoria.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <select 
              className="p-2 border rounded-lg bg-background text-sm"
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            >
              {prioridades.map(prio => (
                <option key={prio.id} value={prio.id}>{prio.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="oportunidades" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="oportunidades">Oportunidades Detectadas</TabsTrigger>
          <TabsTrigger value="meu-plano">Meu Plano de Ação ({opportunidadesSelecionadas.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="oportunidades" className="space-y-4">
          {/* Lista de Oportunidades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtradas.map((oportunidade) => (
              <motion.div
                key={oportunidade.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{oportunidade.titulo}</CardTitle>
                        <CardDescription className="mt-1">{oportunidade.descricao}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTendenciaIcon(oportunidade.tendencia)}
                        <Badge className={getPrioridadeCor(oportunidade.prioridade)}>
                          {prioridades.find(p => p.id === oportunidade.prioridade)?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Local</span>
                        </div>
                        <p className="text-muted-foreground">{oportunidade.local}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Data</span>
                        </div>
                        <p className="text-muted-foreground">
                          {format(parseISO(oportunidade.dataInicio), 'dd/MM', { locale: ptBR })}
                          {oportunidade.dataFim !== oportunidade.dataInicio && 
                            ` - ${format(parseISO(oportunidade.dataFim), 'dd/MM', { locale: ptBR })}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getDiasRestantes(oportunidade.dataInicio) > 0 
                            ? `${getDiasRestantes(oportunidade.dataInicio)} dias`
                            : 'Acontecendo agora'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Audiência</span>
                        </div>
                        <p className="text-muted-foreground">{oportunidade.audienciaEstimada.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Potencial</span>
                        </div>
                        <p className="text-muted-foreground">{oportunidade.potencialReceita}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 text-sm">Tipo de Oportunidade:</h5>
                      <p className="text-sm text-muted-foreground">{oportunidade.tipoOportunidade}</p>
                    </div>

                    {oportunidade.dicas.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Dicas Estratégicas:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {oportunidade.dicas.slice(0, 2).map((dica, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">•</span>
                              {dica}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => adicionarAoPlano(oportunidade)}
                        size="sm"
                        className="flex-1"
                        disabled={opportunidadesSelecionadas.find(o => o.id === oportunidade.id)}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        {opportunidadesSelecionadas.find(o => o.id === oportunidade.id) ? 'Adicionada' : 'Adicionar ao Plano'}
                      </Button>
                      <Button 
                        onClick={() => criarCampanhaAutomatica(oportunidade)}
                        variant="outline"
                        size="sm"
                      >
                        <Zap className="w-3 h-3 mr-2" />
                        Campanha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtradas.length === 0 && (
            <div className="text-center py-12">
              <Compass className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma oportunidade encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="meu-plano" className="space-y-4">
          {opportunidadesSelecionadas.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Seu Plano de Ação</h3>
                <p className="text-sm text-muted-foreground">
                  {opportunidadesSelecionadas.length} oportunidades selecionadas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunidadesSelecionadas.map((oportunidade) => (
                  <Card key={oportunidade.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold">{oportunidade.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{oportunidade.local}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removerDoPlano(oportunidade.id)}
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Data:</span>
                          <span>{format(parseISO(oportunidade.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Potencial:</span>
                          <span className="text-green-600">{oportunidade.potencialReceita}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dias restantes:</span>
                          <span className="font-medium">{getDiasRestantes(oportunidade.dataInicio)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{opportunidadesSelecionadas.length}</div>
                      <p className="text-sm text-muted-foreground">Oportunidades</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {opportunidadesSelecionadas.reduce((acc, opp) => acc + opp.audienciaEstimada, 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Audiência Total</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">R$ 25K+</div>
                      <p className="text-sm text-muted-foreground">Potencial Estimado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma oportunidade no plano</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione oportunidades para criar seu plano de ação
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Como o OPPORTUNE Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">🔍 Detecção Automática:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Monitora calendários de eventos</li>
                <li>• Rastreia tendências no Google</li>
                <li>• Analisa fenômenos naturais</li>
                <li>• Detecta feriados prolongados</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">📊 Análise Inteligente:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Calcula potencial de audiência</li>
                <li>• Avalia nível de competição</li>
                <li>• Estima receita possível</li>
                <li>• Prioriza por relevância</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🚀 Ação Automatizada:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Gera campanhas prontas</li>
                <li>• Cria planos de ação</li>
                <li>• Sugere estratégias específicas</li>
                <li>• Envia alertas de timing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default OpportunePage;