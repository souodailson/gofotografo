import { supabase } from '@/lib/supabaseClient';

// ===== PROFILES =====

export const createFreelaProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('freela_profiles')
    .insert([profileData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getFreelaProfile = async (userId) => {
  const { data, error } = await supabase
    .from('freela_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateFreelaProfile = async (profileId, updates) => {
  const { data, error } = await supabase
    .from('freela_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getAllProfiles = async (filters = {}) => {
  let query = supabase
    .from('freela_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.categories?.length > 0) {
    query = query.overlaps('categories', filters.categories);
  }
  
  if (filters.regions?.length > 0) {
    query = query.overlaps('regions', filters.regions);
  }
  
  if (filters.availability) {
    query = query.eq('availability_status', filters.availability);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ===== PORTFOLIO =====

export const addPortfolioItem = async (portfolioData) => {
  const { data, error } = await supabase
    .from('freela_portfolio')
    .insert([portfolioData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPortfolio = async (profileId) => {
  const { data, error } = await supabase
    .from('freela_portfolio')
    .select('*')
    .eq('profile_id', profileId)
    .order('order_position', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updatePortfolioItem = async (itemId, updates) => {
  const { data, error } = await supabase
    .from('freela_portfolio')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deletePortfolioItem = async (itemId) => {
  const { error } = await supabase
    .from('freela_portfolio')
    .delete()
    .eq('id', itemId);
  
  if (error) throw error;
};

// ===== JOBS =====

export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('freela_jobs')
    .insert([jobData])
    .select(`
      *,
      posted_by_profile:freela_profiles!posted_by(id, name, profile_image_url, rating, verified)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const getJobs = async (filters = {}) => {
  let query = supabase
    .from('freela_jobs')
    .select(`
      *,
      posted_by_profile:freela_profiles!posted_by(id, name, profile_image_url, rating, verified)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.region) {
    query = query.eq('region', filters.region);
  }
  
  if (filters.remote_work !== undefined) {
    query = query.eq('remote_work', filters.remote_work);
  }
  
  if (filters.date_from) {
    query = query.gte('job_date', filters.date_from);
  }
  
  if (filters.date_to) {
    query = query.lte('job_date', filters.date_to);
  }
  
  if (filters.budget_min) {
    query = query.gte('budget_min', filters.budget_min);
  }
  
  if (filters.budget_max) {
    query = query.lte('budget_max', filters.budget_max);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('freela_jobs')
    .select(`
      *,
      posted_by_profile:freela_profiles!posted_by(id, name, profile_image_url, rating, verified, phone, email)
    `)
    .eq('id', jobId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from('freela_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteJob = async (jobId) => {
  const { error } = await supabase
    .from('freela_jobs')
    .delete()
    .eq('id', jobId);
  
  if (error) throw error;
};

export const incrementJobViews = async (jobId) => {
  try {
    const { data, error } = await supabase
      .from('freela_jobs')
      .update({ views_count: supabase.raw('views_count + 1') })
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    // Fallback: just return current job data without incrementing
    const { data } = await supabase
      .from('freela_jobs')
      .select('views_count')
      .eq('id', jobId)
      .single();
    return data;
  }
};

// ===== APPLICATIONS =====

export const createApplication = async (applicationData) => {
  const { data, error } = await supabase
    .from('freela_applications')
    .insert([applicationData])
    .select(`
      *,
      freelancer:freela_profiles!freelancer_id(id, name, profile_image_url, rating, verified),
      job:freela_jobs!job_id(id, title, budget_min, budget_max)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const getApplicationsForJob = async (jobId) => {
  const { data, error } = await supabase
    .from('freela_applications')
    .select(`
      *,
      freelancer:freela_profiles!freelancer_id(id, name, profile_image_url, rating, verified, bio)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getFreelancerApplications = async (freelancerId) => {
  const { data, error } = await supabase
    .from('freela_applications')
    .select(`
      *,
      job:freela_jobs!job_id(id, title, location, job_date, budget_min, budget_max, status)
    `)
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateApplication = async (applicationId, updates) => {
  const { data, error } = await supabase
    .from('freela_applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== MESSAGES =====

export const sendMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('freela_messages')
    .insert([messageData])
    .select(`
      *,
      sender:freela_profiles!sender_id(id, name, profile_image_url),
      receiver:freela_profiles!receiver_id(id, name, profile_image_url)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const getConversationMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('freela_messages')
    .select(`
      *,
      sender:freela_profiles!sender_id(id, name, profile_image_url),
      receiver:freela_profiles!receiver_id(id, name, profile_image_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const getConversations = async (profileId) => {
  const { data, error } = await supabase
    .from('freela_messages')
    .select(`
      conversation_id,
      job_id,
      sender:freela_profiles!sender_id(id, name, profile_image_url),
      receiver:freela_profiles!receiver_id(id, name, profile_image_url),
      message,
      created_at,
      read_at
    `)
    .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Agrupa por conversation_id para pegar a última mensagem de cada conversa
  const conversations = {};
  data.forEach(msg => {
    if (!conversations[msg.conversation_id] || 
        new Date(msg.created_at) > new Date(conversations[msg.conversation_id].created_at)) {
      conversations[msg.conversation_id] = msg;
    }
  });
  
  return Object.values(conversations);
};

export const markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from('freela_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== FAVORITES =====

export const addToFavorites = async (userId, jobId) => {
  const { data, error } = await supabase
    .from('freela_favorites')
    .insert([{ user_id: userId, job_id: jobId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeFromFavorites = async (userId, jobId) => {
  const { error } = await supabase
    .from('freela_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId);
  
  if (error) throw error;
};

export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('freela_favorites')
    .select(`
      *,
      job:freela_jobs!job_id(
        *,
        posted_by_profile:freela_profiles!posted_by(id, name, profile_image_url, rating, verified)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const checkIfFavorite = async (userId, jobId) => {
  const { data, error } = await supabase
    .from('freela_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// ===== REVIEWS =====

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('freela_reviews')
    .insert([reviewData])
    .select(`
      *,
      reviewer:freela_profiles!reviewer_id(id, name, profile_image_url),
      reviewed:freela_profiles!reviewed_id(id, name, profile_image_url)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const getProfileReviews = async (profileId) => {
  const { data, error } = await supabase
    .from('freela_reviews')
    .select(`
      *,
      reviewer:freela_profiles!reviewer_id(id, name, profile_image_url),
      job:freela_jobs!job_id(id, title)
    `)
    .eq('reviewed_id', profileId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// ===== NOTIFICATIONS =====

export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('freela_notifications')
    .insert([notificationData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('freela_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('freela_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== REPORTS =====

export const createReport = async (reportData) => {
  const { data, error } = await supabase
    .from('freela_reports')
    .insert([reportData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== UTILITY FUNCTIONS =====

export const uploadImage = async (file, bucket = 'freela-images', folder = '') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrl;
};

export const deleteImage = async (url, bucket = 'freela-images') => {
  try {
    const fileName = url.split('/').pop();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) throw error;
  } catch (error) {
    console.warn('Erro ao deletar imagem:', error);
  }
};

// ===== CONSTANTS =====

export const FREELA_CATEGORIES = [
  'fotografia',
  'filmmaker',
  'storymaker',
  'editor_video',
  'editor_foto',
  'motion_design',
  'designer_grafico',
  'social_media',
  'drone',
  'livestream',
  'producao',
  'assistente'
];

export const FREELA_REGIONS = [
  'Acre (AC)',
  'Alagoas (AL)',
  'Amapá (AP)',
  'Amazonas (AM)',
  'Bahia (BA)',
  'Ceará (CE)',
  'Distrito Federal (DF)',
  'Espírito Santo (ES)',
  'Goiás (GO)',
  'Maranhão (MA)',
  'Mato Grosso (MT)',
  'Mato Grosso do Sul (MS)',
  'Minas Gerais (MG)',
  'Pará (PA)',
  'Paraíba (PB)',
  'Paraná (PR)',
  'Pernambuco (PE)',
  'Piauí (PI)',
  'Rio de Janeiro (RJ)',
  'Rio Grande do Norte (RN)',
  'Rio Grande do Sul (RS)',
  'Rondônia (RO)',
  'Roraima (RR)',
  'Santa Catarina (SC)',
  'São Paulo (SP)',
  'Sergipe (SE)',
  'Tocantins (TO)',
  'Nacional',
  'Internacional'
];

export const PAYMENT_TYPES = [
  { value: 'hourly', label: 'Por Hora' },
  { value: 'daily', label: 'Diária' },
  { value: 'project', label: 'Projeto Completo' }
];

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-500' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
];