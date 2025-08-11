export const FINANCIAL_CATEGORIES = {
  ENTRADA: [
    { value: 'sessao_fotos', label: 'Sessão de Fotos', icon: '📸' },
    { value: 'evento', label: 'Evento/Casamento', icon: '💒' },
    { value: 'ensaio', label: 'Ensaio', icon: '🌟' },
    { value: 'album', label: 'Álbum/Produto', icon: '📚' },
    { value: 'edicao', label: 'Edição de Fotos', icon: '✨' },
    { value: 'consultoria', label: 'Consultoria', icon: '💡' },
    { value: 'curso', label: 'Curso/Workshop', icon: '🎓' },
    { value: 'licenciamento', label: 'Licenciamento de Imagem', icon: '📄' },
    { value: 'book', label: 'Book Fotográfico', icon: '📖' },
    { value: 'corporativo', label: 'Evento Corporativo', icon: '🏢' },
    { value: 'newborn', label: 'Newborn', icon: '👶' },
    { value: 'gestante', label: 'Ensaio Gestante', icon: '🤱' },
    { value: 'familia', label: 'Ensaio Família', icon: '👨‍👩‍👧‍👦' },
    { value: 'formatura', label: 'Formatura', icon: '🎓' },
    { value: 'aniversario', label: 'Aniversário', icon: '🎂' },
    { value: 'outros', label: 'Outros', icon: '📷' }
  ],
  SAIDA: [
    { value: 'equipamento', label: 'Equipamento Fotográfico', icon: '📹' },
    { value: 'lente', label: 'Lentes', icon: '🔍' },
    { value: 'iluminacao', label: 'Iluminação', icon: '💡' },
    { value: 'tripé', label: 'Tripés/Suportes', icon: '🏗️' },
    { value: 'software', label: 'Software/Licenças', icon: '💻' },
    { value: 'marketing', label: 'Marketing/Publicidade', icon: '📢' },
    { value: 'site', label: 'Site/Hospedagem', icon: '🌐' },
    { value: 'curso_capacitacao', label: 'Cursos/Capacitação', icon: '📚' },
    { value: 'transporte', label: 'Transporte/Combustível', icon: '🚗' },
    { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
    { value: 'estudio', label: 'Aluguel Estúdio', icon: '🏠' },
    { value: 'cenario', label: 'Cenários/Props', icon: '🎭' },
    { value: 'assistente', label: 'Assistente/Freelancer', icon: '👤' },
    { value: 'contador', label: 'Contador/Contabilidade', icon: '📊' },
    { value: 'seguro', label: 'Seguro Equipamentos', icon: '🛡️' },
    { value: 'manutencao', label: 'Manutenção Equipamentos', icon: '🔧' },
    { value: 'material', label: 'Material Escritório', icon: '📝' },
    { value: 'backup', label: 'Backup/Armazenamento', icon: '💾' },
    { value: 'juridico', label: 'Jurídico/Advocacia', icon: '⚖️' },
    { value: 'outros', label: 'Outros', icon: '💸' }
  ]
};

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: '🔄' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cheque', label: 'Cheque', icon: '📄' },
  { value: 'ted', label: 'TED', icon: '🏦' },
  { value: 'doc', label: 'DOC', icon: '🏦' },
  { value: 'deposito', label: 'Depósito Bancário', icon: '🏧' },
  { value: 'boleto', label: 'Boleto', icon: '📊' },
  { value: 'outros', label: 'Outros', icon: '💰' }
];

export const PERIOD_FILTERS = [
  { value: 'all', label: 'Todos os períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'last_90_days', label: 'Últimos 90 dias' },
  { value: 'last_year', label: 'Último ano' },
  { value: 'current_year', label: 'Este ano' },
  { value: 'custom', label: 'Período personalizado' }
];

export const LIST_FILTERS = [
  { key: 'geral', label: 'Lançamentos Gerais', icon: 'ListFilter' },
  { key: 'pagar', label: 'Contas a Pagar', icon: 'TrendingDown' },
  { key: 'receber', label: 'Contas a Receber', icon: 'TrendingUp' },
  { key: 'atrasadas', label: 'Contas Atrasadas', icon: 'AlertTriangle' },
  { key: 'inadimplentes', label: 'Clientes Inadimplentes', icon: 'UserX' }
];