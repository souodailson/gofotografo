import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/authContext';
import { getUserRealFinancialData, generateStrategicPlan, getLocalMarketData } from '@/lib/realDataApi';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Calculator,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Users,
  Camera,
  Zap,
  Trophy,
  Rocket,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MetasPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [metaValor, setMetaValor] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [ticketMedio, setTicketMedio] = useState('');
  const [taxaConversao, setTaxaConversao] = useState('20');
  const [resultados, setResultados] = useState(null);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const [trabalhosRealizados, setTrabalhosRealizados] = useState(0);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [planoEstrategico, setPlanoEstrategico] = useState(null);

  // Dados reais do usuário
  const [dadosProgressoAtual, setDadosProgressoAtual] = useState({
    faturamentoAtual: 0,
    faturamentoAnual: 0,
    trabalhosFeitos: 0,
    leadsGerados: 0,
    clientesConvertidos: 0,
    diasRestantes: 0,
    taxaConversao: 0
  });

  // Carregar dados reais do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setLoadingUserData(true);
      try {
        const userData = await getUserRealFinancialData(user.id);
        setDadosProgressoAtual(userData);
        
        // Definir ticket médio baseado nos dados reais se disponível
        if (userData.trabalhosFeitos > 0 && userData.faturamentoAtual > 0) {
          const ticketCalculado = Math.round(userData.faturamentoAtual / userData.trabalhosFeitos);
          setTicketMedio(ticketCalculado.toString());
        }
        
        // Definir taxa de conversão real se disponível
        if (userData.taxaConversao > 0) {
          setTaxaConversao(userData.taxaConversao.toString());
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast({
          title: 'Aviso',
          description: 'Usando dados estimados. Conecte seu sistema financeiro para dados precisos.',
        });
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user, toast]);

  const calcularMeta = async () => {
    if (!metaValor || !ticketMedio) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o valor da meta e ticket médio.',
        variant: 'destructive'
      });
      return;
    }

    const valorMeta = parseFloat(metaValor);
    const ticket = parseFloat(ticketMedio);
    const conversao = parseFloat(taxaConversao) / 100;
    
    // Cálculos principais
    const trabalhosNecessarios = Math.ceil(valorMeta / ticket);
    const leadsNecessarios = Math.ceil(trabalhosNecessarios / conversao);
    const leadsPorDia = Math.ceil(leadsNecessarios / getDiasPeriodo());
    const trabalhosPorSemana = Math.ceil(trabalhosNecessarios / (getDiasPeriodo() / 7));
    
    // Análise do progresso atual
    const progressoPercentual = (dadosProgressoAtual.faturamentoAtual / valorMeta) * 100;
    const trabalhosRestantes = trabalhosNecessarios - dadosProgressoAtual.trabalhosFeitos;
    const leadsRestantes = leadsNecessarios - dadosProgressoAtual.leadsGerados;
    
    const resultadosCalculados = {
      valorMeta,
      trabalhosNecessarios,
      leadsNecessarios,
      leadsPorDia,
      trabalhosPorSemana,
      progressoPercentual: Math.min(progressoPercentual, 100),
      trabalhosRestantes: Math.max(trabalhosRestantes, 0),
      leadsRestantes: Math.max(leadsRestantes, 0),
      valorRestante: Math.max(valorMeta - dadosProgressoAtual.faturamentoAtual, 0),
      ritmoAtual: dadosProgressoAtual.faturamentoAtual / (getDiasPeriodo() - dadosProgressoAtual.diasRestantes),
      ritmoNecessario: Math.max(valorMeta - dadosProgressoAtual.faturamentoAtual, 0) / dadosProgressoAtual.diasRestantes
    };

    setResultados(resultadosCalculados);

    // Gerar plano estratégico baseado em dados reais
    try {
      const marketData = await getLocalMarketData('sao-paulo', 'casamento');
      const plano = await generateStrategicPlan(
        {
          targetRevenue: valorMeta,
          timeframe: periodo,
          currentRevenue: dadosProgressoAtual.faturamentoAtual,
          averageTicket: ticket,
          conversionRate: parseFloat(taxaConversao)
        },
        dadosProgressoAtual,
        marketData
      );
      
      setPlanoEstrategico(plano);
    } catch (error) {
      console.error('Erro ao gerar plano estratégico:', error);
    }
    
    toast({
      title: 'Meta calculada!',
      description: 'Veja seu plano de ação estratégico baseado em dados reais.',
    });
  };

  const getDiasPeriodo = () => {
    switch (periodo) {
      case 'semana': return 7;
      case 'mes': return 30;
      case 'trimestre': return 90;
      case 'semestre': return 180;
      case 'ano': return 365;
      default: return 30;
    }
  };

  const getPeriodoLabel = () => {
    switch (periodo) {
      case 'semana': return 'esta semana';
      case 'mes': return 'este mês';
      case 'trimestre': return 'este trimestre';
      case 'semestre': return 'este semestre';
      case 'ano': return 'este ano';
      default: return 'este período';
    }
  };

  const getStatusMeta = () => {
    if (!resultados) return null;
    
    const { progressoPercentual, ritmoAtual, ritmoNecessario } = resultados;
    
    if (progressoPercentual >= 100) {
      return { status: 'concluida', color: 'text-green-600', icon: Trophy, message: 'Meta atingida! 🎉' };
    } else if (ritmoAtual >= ritmoNecessario) {
      return { status: 'no-ritmo', color: 'text-blue-600', icon: CheckCircle, message: 'No ritmo certo!' };
    } else if (progressoPercentual >= 70) {
      return { status: 'atencao', color: 'text-yellow-600', icon: AlertTriangle, message: 'Atenção: acelere o ritmo' };
    } else {
      return { status: 'critico', color: 'text-red-600', icon: Zap, message: 'Ação urgente necessária!' };
    }
  };

  const statusMeta = getStatusMeta();

  const acoesRecomendadas = resultados ? [
    {
      condicao: resultados.leadsRestantes > 0,
      acao: `Gerar mais ${resultados.leadsRestantes} leads`,
      dica: 'Intensifique marketing digital e indicações'
    },
    {
      condicao: resultados.trabalhosRestantes > 0,
      acao: `Fechar mais ${resultados.trabalhosRestantes} trabalhos`,
      dica: 'Foque no follow-up e melhore proposta comercial'
    },
    {
      condicao: resultados.ritmoAtual < resultados.ritmoNecessario,
      acao: 'Acelerar ritmo de vendas',
      dica: 'Considere promoções ou parcerias estratégicas'
    },
    {
      condicao: resultados.progressoPercentual < 50 && dadosProgressoAtual.diasRestantes < 15,
      acao: 'Revisar meta ou estratégia',
      dica: 'Meta pode estar muito ambiciosa para o tempo restante'
    }
  ].filter(item => item.condicao) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-yellow-600" />
            METAS - Simulador de Ganhos & Metas Visuais
          </h1>
          <p className="text-muted-foreground mt-2">
            Defina metas, calcule planos de ação e acompanhe seu progresso
          </p>
        </motion.div>

      {/* Configuração da Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Configure sua Meta
          </CardTitle>
          <CardDescription>
            Defina quanto quer faturar e em qual período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="metaValor">Valor da Meta (R$) *</Label>
              <Input
                id="metaValor"
                type="number"
                value={metaValor}
                onChange={(e) => setMetaValor(e.target.value)}
                placeholder="Ex: 15000"
              />
            </div>
            
            <div>
              <Label htmlFor="periodo">Período</Label>
              <select 
                id="periodo"
                className="w-full p-2 border rounded-lg bg-background"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="semana">Semana</option>
                <option value="mes">Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="semestre">Semestre</option>
                <option value="ano">Ano</option>
              </select>
            </div>

            <div>
              <Label htmlFor="ticketMedio">Ticket Médio (R$) *</Label>
              <Input
                id="ticketMedio"
                type="number"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(e.target.value)}
                placeholder="Ex: 1200"
              />
            </div>

            <div>
              <Label htmlFor="taxaConversao">Taxa de Conversão (%)</Label>
              <Input
                id="taxaConversao"
                type="number"
                value={taxaConversao}
                onChange={(e) => setTaxaConversao(e.target.value)}
                placeholder="Ex: 20"
                min="1"
                max="100"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={calcularMeta} className="w-full">
                Calcular Meta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Atual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Faturamento Atual {!loadingUserData && '(dados reais)'}
                </p>
                {loadingUserData ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    R$ {dadosProgressoAtual.faturamentoAtual.toLocaleString()}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Trabalhos Feitos {!loadingUserData && '(dados reais)'}
                </p>
                {loadingUserData ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{dadosProgressoAtual.trabalhosFeitos}</p>
                )}
              </div>
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Leads Gerados {!loadingUserData && '(dados reais)'}
                </p>
                {loadingUserData ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">{dadosProgressoAtual.leadsGerados}</p>
                )}
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Restantes no Mês</p>
                {loadingUserData ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                ) : (
                  <p className="text-2xl font-bold text-orange-600">{dadosProgressoAtual.diasRestantes}</p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados da Meta */}
      {resultados && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Status da Meta */}
          {statusMeta && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <statusMeta.icon className={`w-8 h-8 ${statusMeta.color}`} />
                    <div>
                      <h3 className={`text-xl font-bold ${statusMeta.color}`}>
                        {statusMeta.message}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Progresso atual: {resultados.progressoPercentual.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      R$ {resultados.valorRestante.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">restantes</p>
                  </div>
                </div>
                
                <Progress value={resultados.progressoPercentual} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>R$ 0</span>
                  <span>R$ {resultados.valorMeta.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plano de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5" />
                  Trabalhos Necessários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {resultados.trabalhosNecessarios}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    total para {getPeriodoLabel()}
                  </p>
                  <div className="mt-4 text-sm">
                    <p><strong>{resultados.trabalhosPorSemana}</strong> por semana</p>
                    <p className="text-muted-foreground">
                      Restam: <strong>{resultados.trabalhosRestantes}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Leads Necessários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {resultados.leadsNecessarios}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    total para {getPeriodoLabel()}
                  </p>
                  <div className="mt-4 text-sm">
                    <p><strong>{resultados.leadsPorDia}</strong> por dia</p>
                    <p className="text-muted-foreground">
                      Restam: <strong>{resultados.leadsRestantes}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Ritmo Necessário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    R$ {Math.round(resultados.ritmoNecessario).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    por dia restante
                  </p>
                  <div className="mt-4 text-sm">
                    <p>Ritmo atual: <strong>R$ {Math.round(resultados.ritmoAtual).toLocaleString()}/dia</strong></p>
                    <Badge className={
                      resultados.ritmoAtual >= resultados.ritmoNecessario 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }>
                      {resultados.ritmoAtual >= resultados.ritmoNecessario ? 'No ritmo!' : 'Acelerar!'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Recomendadas */}
          {acoesRecomendadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Ações Recomendadas
                </CardTitle>
                <CardDescription>
                  Passos específicos para atingir sua meta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {acoesRecomendadas.map((acao, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{acao.acao}</p>
                        <p className="text-sm text-muted-foreground">{acao.dica}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Análise Detalhada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Breakdown Financeiro</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Meta total:</span>
                      <span className="font-medium">R$ {resultados.valorMeta.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Já faturado:</span>
                      <span className="font-medium text-green-600">R$ {dadosProgressoAtual.faturamentoAtual.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restante:</span>
                      <span className="font-medium text-blue-600">R$ {resultados.valorRestante.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Ticket médio:</span>
                      <span className="font-medium">R$ {parseFloat(ticketMedio).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa de conversão:</span>
                      <span className="font-medium">{taxaConversao}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progresso temporal:</span>
                      <span className="font-medium">
                        {Math.round(((getDiasPeriodo() - dadosProgressoAtual.diasRestantes) / getDiasPeriodo()) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eficiência atual:</span>
                      <span className={`font-medium ${
                        resultados.progressoPercentual >= ((getDiasPeriodo() - dadosProgressoAtual.diasRestantes) / getDiasPeriodo()) * 100
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {resultados.progressoPercentual >= ((getDiasPeriodo() - dadosProgressoAtual.diasRestantes) / getDiasPeriodo()) * 100
                          ? 'Acima' : 'Abaixo'} do esperado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plano Estratégico Personalizado */}
      {planoEstrategico && planoEstrategico.strategies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Plano Estratégico Personalizado
              </CardTitle>
              <CardDescription>
                Estratégias baseadas nos seus dados reais e mercado atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {planoEstrategico.strategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{strategy.category}</h4>
                        <p className="text-sm text-muted-foreground">{strategy.timeframe}</p>
                      </div>
                      <Badge 
                        variant={strategy.impact === 'Alto' ? 'destructive' : 
                                strategy.impact === 'Médio' ? 'default' : 'secondary'}
                      >
                        Impacto {strategy.impact}
                      </Badge>
                    </div>
                    <p className="font-medium mb-2">{strategy.action}</p>
                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                    
                    <div>
                      <h5 className="font-medium mb-2">Táticas recomendadas:</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.tactics.map((tactic, tacticIndex) => (
                          <li key={tacticIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {tactic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                
                {/* Resumo do Plano */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Resumo Executivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Gap a cobrir:</strong> R$ {planoEstrategico.summary.totalGap.toLocaleString()}</p>
                      <p><strong>Meta mensal:</strong> R$ {planoEstrategico.summary.monthlyGoal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Leads necessários/mês:</strong> {planoEstrategico.summary.requiredLeads}</p>
                      <p><strong>Trabalhos necessários/mês:</strong> {planoEstrategico.summary.requiredJobs}</p>
                    </div>
                  </div>
                  {planoEstrategico.summary.recommendedPriceIncrease > 0 && (
                    <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 rounded border-l-4 border-yellow-500">
                      <p className="text-sm">
                        <strong>💡 Recomendação:</strong> Considere aumentar seu ticket médio em 
                        R$ {Math.round(planoEstrategico.summary.recommendedPriceIncrease)} 
                        para alinhar com o mercado e facilitar o atingimento da meta.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dicas para Atingir Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Dicas para Atingir suas Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">📈 Aumentar Vendas:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Melhore seu portfólio constantemente</li>
                <li>• Ofereça pacotes com diferentes valores</li>
                <li>• Implemente sistema de indicações</li>
                <li>• Use gatilhos de escassez e urgência</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🎯 Gerar Mais Leads:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Invista em marketing digital</li>
                <li>• Crie conteúdo relevante nas redes</li>
                <li>• Participe de eventos do nicho</li>
                <li>• Forme parcerias com outros profissionais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default MetasPage;