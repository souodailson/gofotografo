import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Gem, Zap, ShieldCheck, Star, Crown, MessageCircle, Timer, Sparkles, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const PlansPage = ({ setActiveTab }) => {
  const { toast } = useToast();
  const { settings, user, refreshData, planStatus: contextPlanStatus } = useData();
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("status") === "success" && query.get("session_id")) {
      toast({
        title: "Pagamento Bem-Sucedido!",
        description: "Seu plano foi atualizado. Obrigado!",
        variant: "success",
        duration: 7000,
      });
      refreshData(); 
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (query.get("status") === "cancelled") {
      toast({
        title: "Pagamento Cancelado",
        description: "Você cancelou o processo de pagamento. Seu plano não foi alterado.",
        variant: "warning",
        duration: 7000,
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [toast, refreshData]);

  const handleChoosePlan = async (planType, priceId) => {
    if (!priceId) {
      toast({
        title: "Erro de Configuração",
        description: "ID do preço não configurado.",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    if (!user || !user.id) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive"});
        return;
    }

    setLoadingStripe(true);
    setSelectedPlan(planType);

    try {
      // Criar sessão de checkout via API do backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id,
          userEmail: user.email,
          planType: planType,
          successUrl: `${window.location.origin}/plans?session_id={CHECKOUT_SESSION_ID}&plan_type=${planType}&status=success`,
          cancelUrl: `${window.location.origin}/plans?plan_type=${planType}&status=cancelled`
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const { url } = await response.json();
      
      // Redirecionar diretamente para o Stripe
      window.location.href = url;

    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({ 
        title: "Erro no Pagamento", 
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente.", 
        variant: "destructive" 
      });
      setLoadingStripe(false);
      setSelectedPlan(null);
    }
  };

  const monthlyFeatures = [
    'Agenda Inteligente com agendamento por link para fechar trabalhos até enquanto você dorme.',
    'Funil de Vendas para acompanhar cada oportunidade até a conversão.',
    'Controle Financeiro Avançado para saber exatamente o que entra e sai, sem surpresas.',
    'Gestão de Clientes Ilimitada, com histórico completo de relacionamento.',
    'Captação Automática de Leads, Feedbacks e Formulários Personalizados para atrair e nutrir potenciais clientes.',
    'Geração Instantânea de Contratos com templates prontos e personalizáveis.',
    'Gestão Completa de Equipamentos com cálculo automático de depreciação e histórico de manutenção.',
    'Precifique com Segurança usando nosso sistema inteligente para nunca mais cobrar menos do que vale.',
    'Reservas Inteligentes para garantir datas e fechar mais trabalhos.',
    'GO.STUDIO – Crie propostas de alto impacto em landing pages profissionais e gere contratos em minutos.',
    'Quadros Ilimitados no estilo Kanban, anotações, listas e muito mais, salvos e sincronizados 24h por dia.',
    'Programa de Indicação: traga novos assinantes e receba comissão extra.'
  ];

  const annualBonuses = [
    'Atendimento VIP por WhatsApp 24/7',
    'INSPIRA – Central de ideias para ensaios inesquecíveis.',
    'SEASON – Planejador sazonal para aproveitar datas e oportunidades do ano.',
    'OPPORTUNE – Mapa de oportunidades fotográficas na sua região.',
    'GO.MOV – Calculadora real de logística, deslocamento e custos de produção.',
    'SPOT – Mapa de fornecedores e locações estratégicas.',
    'RESPOSTAS RÁPIDAS – Kit pronto para agilizar seu atendimento.',
    'METAS – Simulador de ganhos e metas visuais para manter seu foco.',
    'RIVAL – Radar de concorrência e mercado para estar sempre à frente.'
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-customPurple to-customGreen mb-6">
          ESCOLHA SEU PLANO
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Tudo o que um fotógrafo profissional precisa para dominar a gestão e aumentar as vendas
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* PLANO MENSAL */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-card rounded-3xl shadow-xl border border-border p-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">PLANO PROFISSIONAL</h2>
            <p className="text-lg text-blue-600 font-semibold">MENSAL</p>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-foreground">R$ 49,90</span>
              <span className="text-muted-foreground text-lg">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Sem compromisso, cancele quando quiser
            </p>
          </div>

          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Tudo o que um fotógrafo profissional precisa para dominar a gestão e aumentar as vendas
            </h3>
            
            <ul className="space-y-4 text-sm mb-8">
              {monthlyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            onClick={() => handleChoosePlan('monthly', 'price_1RvmtzDORq3T75OLRhl7tGjp')} 
            disabled={loadingStripe}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            {loadingStripe && selectedPlan === 'monthly' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            Começar Agora
          </Button>
        </motion.div>

        {/* PLANO ANUAL PROMOCIONAL */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl shadow-2xl border-2 border-orange-400 p-8 flex flex-col relative overflow-hidden"
        >
          {/* Badge de destaque */}
          <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-6 py-2 rounded-full transform rotate-12 shadow-lg">
            <Timer className="w-4 h-4 inline mr-1" />
            OFERTA LIMITADA
          </div>
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-orange-500 mr-2" />
              <h2 className="text-2xl font-bold text-foreground">PLANO PROFISSIONAL</h2>
            </div>
            <p className="text-lg text-orange-600 font-semibold">ANUAL PROMOCIONAL</p>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-2xl text-muted-foreground line-through">R$ 598,80</span>
                <Badge className="bg-red-500 text-white px-3 py-1">
                  67% OFF
                </Badge>
              </div>
              <div>
                <span className="text-5xl font-extrabold text-orange-600">R$ 197,90</span>
                <span className="text-muted-foreground text-lg">/ano</span>
              </div>
              <p className="text-sm text-orange-600 font-semibold">
                💡 O plano que paga por si mesmo em um único trabalho
              </p>
            </div>
          </div>

          <div className="flex-grow">
            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
                Tudo do plano mensal + benefícios exclusivos:
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MessageCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Atendimento VIP por WhatsApp 24/7
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Acesso Antecipado às novas funcionalidades revolucionárias:
                  </p>
                  <ul className="space-y-2 text-sm">
                    {annualBonuses.map((bonus, i) => (
                      <li key={i} className="flex items-start">
                        <ArrowRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-center font-semibold text-orange-700 dark:text-orange-300">
                💡 Oferta por tempo limitado – Depois que acabar, o preço volta ao normal.<br/>
                📈 Invista R$ 197,90 e transforme sua forma de trabalhar durante o ano inteiro.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => handleChoosePlan('annual', 'price_1RvmtzDORq3T75OLVIfIicv5')} 
            disabled={loadingStripe}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
            <div className="relative flex items-center justify-center">
              {loadingStripe && selectedPlan === 'annual' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Crown className="w-5 h-5 mr-2" />
              )}
              Garantir Oferta Especial
            </div>
          </Button>
          
          <p className="text-xs text-center mt-4 text-orange-600 font-medium">
            ⚠️ Esta oferta promocional não pode ser parcelada. Preço especial apenas para novas assinaturas.
          </p>
        </motion.div>
      </div>

      {/* Seção de esclarecimentos */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-16 max-w-4xl mx-auto"
      >
        <div className="bg-muted/50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-center mb-6 flex items-center justify-center">
            <Lock className="w-5 h-5 mr-2 text-customPurple" />
            Informações Importantes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Plano Mensal:</h4>
              <ul className="space-y-1">
                <li>• R$ 49,90 por mês</li>
                <li>• Sem compromisso anual</li>
                <li>• Cancele quando quiser</li>
                <li>• Upgrade para anual: R$ 598,80</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">Plano Anual Promocional:</h4>
              <ul className="space-y-1">
                <li>• R$ 197,90 (apenas primeira assinatura)</li>
                <li>• Renovação: R$ 598,80/ano (parcelável em 12x)</li>
                <li>• Não parcelável na promoção</li>
                <li>• Benefícios exclusivos inclusos</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <p className="text-muted-foreground">
          Dúvidas? <a href="mailto:suporte@gofotografo.com" className="text-customPurple dark:text-customGreen font-medium hover:underline">Fale conosco</a>.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Pagamentos processados com segurança pela Stripe. Todos os planos incluem atualizações contínuas.
        </p>
      </motion.div>
    </div>
  );
};

export default PlansPage;