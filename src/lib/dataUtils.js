import { calculateFinancialSummary } from '@/lib/financialUtils';
import { getTransactionsByUserId } from '@/lib/db/financialApi';
import { supabase } from '@/lib/supabaseClient';

export const handleSupabaseError = (error, context, toast) => {
  console.error(`Erro em ${context}:`, error);
  const userMessage = `Erro em ${context}: ${error.message}`;
  if (toast) {
    toast({
      title: 'Erro de Sistema',
      description: userMessage,
      variant: 'destructive',
      duration: 5000,
    });
  }
};

export const initialSettingsData = {
  profile_photo: null,
  logo: null,
  business_name: '',
  user_name: '',
  subdomain: '',
  notifications: { email: true, push: true },
  dashboard_layout: null,
  workflow_columns: [
    { id: 'novo-lead', title: 'Novos Leads', cardIds: [], color: 'bg-slate-200 dark:bg-slate-700' },
    { id: 'proposta-enviada', title: 'Propostas Enviadas', cardIds: [], color: 'bg-slate-200 dark:bg-slate-700' },
    { id: 'negocio-fechado', title: 'Negócios Fechados', cardIds: [], color: 'bg-slate-200 dark:bg-slate-700' },
    { id: 'agendado', title: 'Agendado', cardIds: [], color: 'bg-teal-300 dark:bg-teal-700' },
    { id: 'em-andamento', title: 'Em Andamento', cardIds: [], color: 'bg-slate-200 dark:bg-slate-700' },
    { id: 'concluido', title: 'Concluídos', cardIds: [], color: 'bg-slate-200 dark:bg-slate-700' },
  ],
  address: '',
  photography_type: '',
  cnpj: '',
  cpf: '',
  phones: [],
  contact_email: '',
  website_social: { instagram: '', facebook: '', website: '' },
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  date_format: 'dd/MM/yyyy',
  automation: {},
  current_plan_id: 'FREE',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  plan_expires_at: null,
  plan_status: 'FREE',
  trial_ends_at: null,
  hide_dashboard_balances: false,
  took_initial_tour: false,
  has_completed_tour: false,
  show_greetings: true,
  workflow_card_view_mode: 'list',
  workflow_summary_expanded: true,
  mobile_menu_items: ['dashboard', 'workflow', 'clients', 'financial', 'calendar'],
  google_calendar_integrated: false,
  google_tokens: null,
  feature_overrides: {},
  pix_key: null
};

export const initialWorkflowColumnsData = [
  { "id": "novo-lead", "title": "Novos Leads", "cardIds": [] },
  { "id": "proposta-enviada", "title": "Propostas Enviadas", "cardIds": [] },
  { "id": "negocio-fechado", "title": "Negócios Fechados", "cardIds": [] },
  { "id": "agendado", "title": "Agendado", "cardIds": [] },
  { "id": "em-andamento", "title": "Em Andamento", "cardIds": [] },
  { "id": "concluido", "title": "Concluídos", "cardIds": [] }
];


export const fetchAllData = async (supabase, userId) => {
  const [
    { data: clientsData, error: clientsError },
    { data: workflowData, error: workflowError },
    { data: packagesData, error: packagesError },
    { data: equipmentsData, error: equipmentsError },
    { data: maintenancesData, error: maintenancesError },
    { data: fixedCostsData, error: fixedCostsError },
    { data: pricedServicesData, error: pricedServicesError },
    { data: savingGoalsData, error: savingGoalsError },
    { data: availabilitySlotsData, error: availabilitySlotsError },
    { data: proposalsData, error: proposalsError },
    { data: blogPostsData, error: blogPostsError },
    { data: featureFlagsData, error: featureFlagsError },
    { data: affiliateSettingsData, error: affiliateSettingsError },
    { data: referralsData, error: referralsError },
    { data: commissionsData, error: commissionsError },
    { data: walletsData, error: walletsError },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('workflow_cards').select('*').eq('user_id', userId).order('order', { ascending: true }),
    supabase.from('service_packages').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('equipamentos').select('*').eq('user_id', userId).order('data_compra', { ascending: false }),
    supabase.from('manutencoes').select('*').eq('user_id', userId).order('data_manutencao', { ascending: false }),
    supabase.from('custos_fixos').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('servicos_precificados').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('metas_reserva').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('availability_slots').select('*').eq('user_id', userId).order('start_time', { ascending: true }),
    supabase.from('propostas').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }),
    supabase.from('feature_flags').select('*'),
    supabase.from('affiliate_settings').select('*').eq('id', 1).single(),
    supabase.from('referrals').select('*').eq('referrer_id', userId),
    supabase.from('commissions').select('*, referral:referrals(*)').eq('referrer_id', userId),
    supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
  ]);

  return {
    clientsData, clientsError,
    workflowData, workflowError,
    packagesData, packagesError,
    equipmentsData, equipmentsError,
    maintenancesData, maintenancesError,
    fixedCostsData, fixedCostsError,
    pricedServicesData, pricedServicesError,
    savingGoalsData, savingGoalsError,
    availabilitySlotsData, availabilitySlotsError,
    proposalsData, proposalsError,
    blogPostsData, blogPostsError,
    featureFlagsData, featureFlagsError,
    affiliateSettingsData, affiliateSettingsError,
    referralsData, referralsError,
    commissionsData, commissionsError,
    walletsData, walletsError,
  };
};