import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, DollarSign, ShieldCheck, Users, CheckCircle, Heart, Lock, GanttChartSquare, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useMobileLayout from '@/hooks/useMobileLayout';

const Header = () => {
  const navigate = useNavigate();
  const { isMobile } = useMobileLayout();
  
  if (isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-lp-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-2"
          >
            <a href="#features" className="text-sm font-medium text-lp-muted hover:text-lp-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-white/10">Recursos</a>
            <a href="#security" className="text-sm font-medium text-lp-muted hover:text-lp-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-white/10">Segurança</a>
            <a href="#pricing" className="text-sm font-medium text-lp-muted hover:text-lp-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-white/10">Planos</a>
          </motion.nav>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-lp-muted hover:text-lp-foreground">Login</Button>
            <Button onClick={() => navigate('/signup')} style={{ backgroundColor: '#e1c38f', color: '#161616' }} className="shadow-lg shadow-lp-accent/20">
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay: delay * 0.1, ease: "easeOut" }}
    className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-lg hover:border-lp-accent/50 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-lp-accent/20 to-white/5 mb-5">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-lp-heading">{title}</h3>
    <p className="text-lp-muted text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Footer = () => {
    const navigate = useNavigate();
    const logoUrlDarkTheme = "https://i.imgur.com/uG5s9s9.png"; 

    return (
        <footer className="bg-white/5 border-t border-white/10 mt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <img src={logoUrlDarkTheme} alt="GO.FOTÓGRAFO Logo" className="h-9 w-auto mb-4" />
                        <p className="text-lp-muted max-w-md">A plataforma completa para fotógrafos que buscam organização, crescimento e mais tempo para criar.</p>
                    </div>
                    <div>
                        <p className="font-semibold text-lp-heading mb-4">Produto</p>
                        <ul className="space-y-2">
                            <li><a href="#features" className="text-sm text-lp-muted hover:text-lp-foreground">Recursos</a></li>
                            <li><a href="#pricing" className="text-sm text-lp-muted hover:text-lp-foreground">Planos</a></li>
                            <li><button onClick={() => navigate('/login')} className="text-sm text-lp-muted hover:text-lp-foreground">Login</button></li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-lp-heading mb-4">Empresa</p>
                        <ul className="space-y-2">
                            <li><button onClick={() => navigate('/politica-de-privacidade-e-dados')} className="text-sm text-lp-muted hover:text-lp-foreground">Política de Privacidade</button></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-lp-muted text-sm">
                    <p>&copy; {new Date().getFullYear()} GO.FOTÓGRAFO. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

const LandingPage = () => {
  const navigate = useNavigate();
  const logoUrlDarkTheme = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20gofotografo%20claro.png"; 
  
  const gradientIconProps = {
    size: 28,
    strokeWidth: 1.5,
    style: { color: '#e1c38f' }
  };

  return (
    <div className="scroll-smooth overflow-x-hidden" style={{ backgroundColor: '#161616', color: '#f4f7f2' }}>
      <Header />
      <main>
        <section className="relative overflow-hidden py-24 md:py-40">
           <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,195,143,0.3),rgba(22,22,22,0))]"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img src={logoUrlDarkTheme} alt="GO.FOTÓGRAFO Logo" className="h-12 w-auto mx-auto mb-8" />
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-lp-heading">
                Quem se valoriza,!<br />
                <span className="titulo-gradiente-lp">se organiza!</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-lp-muted mb-10">
                Organize seu fluxo de trabalho, finanças e clientes em um só lugar. Tenha mais tempo para focar na sua paixão e menos na papelada.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button size="lg" onClick={() => navigate('/signup')} style={{ backgroundColor: '#e1c38f', color: '#161616' }} className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:shadow-lp-accent/30 transition-shadow transform hover:scale-105">
                  Comece grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                 <Button size="lg" variant="ghost" onClick={() => navigate('/login')} className="w-full sm:w-auto text-lp-muted hover:text-lp-foreground">
                    Já tenho uma conta
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-20"
        >
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/20">
             <img-replace src="https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//divulgacao%20gofotografo%20site.png" alt="Interface do GO.FOTÓGRAFO exibindo o dashboard financeiro." className="rounded-xl w-full" />
          </div>
        </motion.div>

        <section id="features" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-lp-heading">Cansado do caos?</h2>
              <p className="max-w-2xl mx-auto text-lp-muted mt-4">Conheça os recursos que vão transformar a gestão do seu negócio fotográfico.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<GanttChartSquare {...gradientIconProps} />}
                title="Funil de Vendas Visual" 
                description="Com nosso Kanban, você sabe exatamente em que pé está cada trabalho, do primeiro contato à entrega final. Nada mais cai no esquecimento." 
                delay={0}
              />
              <FeatureCard 
                icon={<Users {...gradientIconProps} />}
                title="CRM Focado em Fotógrafos" 
                description="Centralize informações de clientes, histórico de trabalhos e preferências. Crie relacionamentos duradouros que geram indicações." 
                delay={1}
              />
              <FeatureCard 
                icon={<DollarSign {...gradientIconProps} />}
                title="Financeiro Descomplicado" 
                description="Controle entradas, saídas e veja a saúde financeira do seu negócio em tempo real, sem precisar ser um expert em finanças." 
                delay={2}
              />
              <FeatureCard 
                icon={<Sparkles {...gradientIconProps} />}
                title="Precificação Inteligente" 
                description="Nossa ferramenta calcula o valor justo do seu trabalho, considerando seus custos e margem de lucro, para você precificar com confiança." 
                delay={3}
              />
              <FeatureCard 
                icon={<Calendar {...gradientIconProps} />}
                title="Agenda Unificada" 
                description="Gerencie ensaios, reuniões e prazos em um só lugar. Integre com o Google Agenda para nunca mais ter conflitos de horários." 
                delay={4}
              />
              <FeatureCard 
                icon={<Target {...gradientIconProps} />}
                title="Reserva Inteligente" 
                description="Defina metas e veja seu dinheiro trabalhando para você. Uma parte de cada trabalho é guardada automaticamente para seus sonhos." 
                delay={5}
              />
            </div>
          </div>
        </section>

        <section id="security" className="py-24 bg-white/5 border-y border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-lp-heading">Sua arte e seus dados, <br />em máxima segurança.</h2>
                        <p className="text-lp-muted mb-6">Entendemos que a confiança é a base de tudo. Por isso, investimos em tecnologia de ponta para garantir que suas informações e as de seus clientes estejam sempre protegidas.</p>
                        <ul className="space-y-4 text-lp-muted">
                            <li className="flex items-start">
                                <Lock className="w-5 h-5 text-lp-accent mr-3 mt-1 flex-shrink-0" />
                                <span><strong className="text-lp-foreground">Criptografia de Ponta a Ponta:</strong> Todos os seus dados são criptografados em trânsito e em repouso, utilizando os padrões mais seguros do mercado.</span>
                            </li>
                            <li className="flex items-start">
                                <ShieldCheck className="w-5 h-5 text-lp-accent mr-3 mt-1 flex-shrink-0" />
                                <span><strong className="text-lp-foreground">Infraestrutura Robusta:</strong> Contamos com servidores de alta performance e disponibilidade, garantindo que seu sistema esteja sempre online quando você precisar.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-lp-accent mr-3 mt-1 flex-shrink-0" />
                                <span><strong className="text-lp-foreground">Privacidade como Prioridade:</strong> Seus dados são seus. Jamais compartilharemos suas informações com terceiros. Nossa política de privacidade é transparente e clara.</span>
                            </li>
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex items-center justify-center"
                    >
                        <div className="relative w-64 h-64">
                            <ShieldCheck className="absolute inset-0 m-auto w-full h-full text-lp-accent/10" strokeWidth={0.5} />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0"
                            >
                                <Lock className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 text-lp-accent/80" />
                            </motion.div>
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0"
                            >
                                <CheckCircle className="absolute bottom-8 right-0 w-12 h-12 text-lp-accent/70" />
                                <Users className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-8 text-lp-accent/60" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-lp-heading">Pronto para dar o próximo passo?</h2>
            <p className="max-w-xl mx-auto text-lp-muted mb-10">
              Junte-se a fotógrafos que escolheram a organização e o crescimento.
            </p>
            <Button size="lg" onClick={() => navigate('/signup')} style={{ backgroundColor: '#e1c38f', color: '#161616' }} className="shadow-lg hover:shadow-xl hover:shadow-lp-accent/30 transition-shadow transform hover:scale-105 h-14 text-lg">
              Quero testar gratuitamente
              <Heart className="w-5 h-5 ml-2 fill-current" />
            </Button>
            <p className="text-sm text-lp-muted mt-4">Sem cartão de crédito. Sem compromisso.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;