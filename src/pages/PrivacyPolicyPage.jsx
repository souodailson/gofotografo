import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoUrlLightTheme = "https://i.imgur.com/dykyBO9.png"; 
  const logoUrlDarkTheme = "https://i.imgur.com/NUAO4d4.png";
  const displayLogo = theme === 'dark' ? logoUrlDarkTheme : logoUrlLightTheme;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <img src={displayLogo} alt="GO.FOTÓGRAFO Logo" className="h-9 w-auto" />
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
    return (
        <footer className="bg-card border-t border-border mt-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} GO.FOTÓGRAFO. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <article className="max-w-4xl mx-auto prose dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-a:text-custom-gradient prose-strong:text-foreground">
          <h1 className="text-custom-gradient animate-gradient-text">Política de Privacidade e Proteção de Dados – GO.FOTÓGRAFO</h1>
          <p className="text-sm text-muted-foreground">Última Atualização: 25 de julho de 2025</p>
          
          <h2 id="compromisso">Nosso Compromisso Inabalável com a Sua Privacidade</h2>
          <p>
            Bem-vindo(a) ao GO.FOTÓGRAFO. Sabemos que a gestão do seu negócio fotográfico envolve dados sensíveis e estratégicos — informações de clientes, finanças, projetos e metas. Por isso, a proteção da sua privacidade e a segurança dos seus dados não são meras funcionalidades: são pilares centrais da nossa plataforma.
          </p>
          <p>
            A presente Política de Privacidade tem como objetivo esclarecer, com total transparência, como tratamos seus dados pessoais, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
          </p>

          <h2 id="acesso-zero">1. Princípio de "Acesso Zero": Não Acessamos Seus Dados</h2>
          <p>
            Nosso sistema foi projetado com base no princípio de “Acesso Zero”, o que significa que não temos acesso direto aos dados sensíveis inseridos por você na plataforma. Por meio de criptografia e controles avançados de segurança, operamos como um cofre digital inviolável: gerenciamos a infraestrutura, mas não temos a chave dos seus dados.
          </p>
          <p>As seguintes informações permanecem privadas e sob seu controle exclusivo:</p>
          <ul>
            <li>Sua lista de clientes;</li>
            <li>Seus lançamentos financeiros;</li>
            <li>Seus contratos, orçamentos e pacotes;</li>
            <li>Suas metas na Reserva Inteligente.</li>
          </ul>
          <p>
            Nosso papel é fornecer a segurança e o funcionamento da plataforma, sem jamais visualizar ou manipular esses dados diretamente.
          </p>

          <h2 id="dados-coletados">2. Dados Coletados e Suas Finalidades</h2>
          <h3>a) Dados Pessoais do Usuário (Você, Fotógrafo(a)):</h3>
          <ul>
            <li><strong>Dados de Conta:</strong> nome, e-mail, telefone, senha (armazenada de forma irreversível por hashing).<br/>
            <strong>Finalidade:</strong> criar e proteger sua conta, possibilitar o login seguro e realizar comunicações administrativas.</li>
            <li><strong>Dados de Configuração:</strong> perfil profissional, custos fixos, equipamentos, pacotes, metas e outras preferências de negócio.<br/>
            <strong>Finalidade:</strong> alimentar os módulos "Meu Setup", "Precifique" e "Reserva Inteligente", viabilizando os cálculos operacionais da plataforma.</li>
            <li><strong>Dados de Pagamento:</strong> tratados exclusivamente por nosso parceiro Stripe.<br/>
            <strong>Finalidade:</strong> processar transações com segurança. Não armazenamos informações de cartão de crédito em nossos servidores.</li>
          </ul>

          <h3>b) Dados dos Seus Clientes Finais (Controlados por Você):</h3>
          <ul>
            <li><strong>Dados Cadastrais e de Contato:</strong> nome, e-mail, telefone, CPF/CNPJ, endereço, entre outros.</li>
            <li><strong>Dados de Relacionamento:</strong> datas comemorativas, histórico de contato, origem do cliente, etc.</li>
            <li><strong>Finalidade:</strong> permitir que você utilize recursos como CRM, agendamento de trabalhos, emissão de contratos e automação de marketing.</li>
          </ul>
          <p className="bg-card border-l-4 border-customPurple p-4 rounded-r-lg">
            <strong>Importante:</strong> De acordo com a LGPD, você é o <strong>Controlador</strong> desses dados, e o GO.FOTÓGRAFO atua apenas como <strong>Operador</strong>, processando-os de forma automatizada e segura, sempre sob seu comando e finalidade legítima.
          </p>

          <h2 id="seguranca">3. Medidas de Segurança da Informação</h2>
          <p>
            Empregamos práticas robustas e atualizadas para garantir a integridade, confidencialidade e disponibilidade das informações:
          </p>
          <ul>
            <li><strong>Criptografia SSL/TLS:</strong> protege todos os dados em trânsito entre o seu dispositivo e nossos servidores.</li>
            <li><strong>Criptografia em Repouso:</strong> dados armazenados são criptografados em servidores de alta segurança.</li>
            <li><strong>Segurança a Nível de Linha (Row-Level Security - RLS):</strong> garante o isolamento total entre dados de diferentes usuários.</li>
            <li><strong>Hashing Seguro de Senhas:</strong> uso de algoritmos avançados como o bcrypt, impossibilitando a reversão da senha original.</li>
          </ul>

          <h2 id="compartilhamento">4. Compartilhamento com Suboperadores</h2>
          <p>
            Para garantir a operação estável e segura da plataforma, utilizamos parceiros que atuam como suboperadores, todos contratualmente obrigados a seguir os mesmos padrões de segurança e privacidade exigidos pela LGPD:
          </p>
          <ul>
            <li><strong>Supabase (Google Cloud/AWS):</strong> provedor de backend e banco de dados.</li>
            <li><strong>Stripe:</strong> processador de pagamentos com certificações PCI DSS.</li>
            <li><strong>Hostinger:</strong> provedor de hospedagem web, responsável pela estabilidade e escalabilidade do sistema.</li>
          </ul>
          <p>
            Jamais comercializaremos, cederemos ou compartilharemos seus dados ou os dados de seus clientes com terceiros para fins de marketing ou publicidade.
          </p>

          <h2 id="direitos-lgpd">5. Seus Direitos sob a LGPD</h2>
          <p>
            Você tem o direito de exercer o controle sobre seus dados pessoais. A qualquer momento, pode:
          </p>
          <ul>
            <li>Solicitar acesso aos seus dados;</li>
            <li>Corrigir ou atualizar informações imprecisas;</li>
            <li>Excluir sua conta e solicitar a eliminação completa dos dados;</li>
            <li>Solicitar portabilidade, recebendo seus dados em formato estruturado e de fácil leitura.</li>
          </ul>
          <p>
            Grande parte dessas ações pode ser realizada diretamente no seu painel de usuário. Para demais solicitações, entre em contato conosco.
          </p>
          
          <h2 id="retencao-exclusao">6. Retenção e Exclusão de Dados</h2>
          <p>
            Seus dados serão mantidos enquanto sua conta estiver ativa. Após a solicitação de encerramento da conta, daremos início ao processo seguro de exclusão dos dados, que serão removidos de nossos ambientes de produção em um prazo razoável, salvo se houver obrigação legal de retenção, como obrigações fiscais e contábeis.
          </p>

          <h2 id="dpo">7. Encarregado pelo Tratamento de Dados (DPO)</h2>
          <p>
            Para qualquer dúvida, solicitação ou exercício de direitos, entre em contato com nosso Encarregado de Proteção de Dados:
          </p>
          <div className="bg-card border border-border rounded-lg p-6 my-6 not-prose flex items-start space-x-4">
            <ShieldCheck className="w-8 h-8 text-customGreen flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-foreground">Encarregado de Proteção de Dados – GO.FOTÓGRAFO</p>
              <div className="flex items-center space-x-2 mt-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href="mailto:suporte@ajudandofotografos.com.br" className="text-custom-gradient font-medium">
                  suporte@ajudandofotografos.com.br
                </a>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 font-medium">
            Agradecemos por confiar no GO.FOTÓGRAFO. Nossa missão é empoderar fotógrafos com tecnologia, sempre com respeito absoluto à privacidade e à proteção de dados.
          </p>

        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;