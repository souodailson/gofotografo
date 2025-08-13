import { supabase } from '@/lib/supabaseClient';

// ===== SPOT LOCATIONS API =====

// Buscar todos os spots/locais
export const getAllSpots = async (filters = {}) => {
  try {
    let query = supabase
      .from('spots')
      .select(`
        *,
        spot_ratings (
          id,
          rating,
          comment,
          user_id,
          created_at,
          user:user_id (name, email)
        ),
        spot_photos (
          id,
          photo_url,
          description
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.category && filters.category !== 'todos') {
      query = query.eq('category', filters.category);
    }

    if (filters.region && filters.region !== 'todas') {
      query = query.eq('region', filters.region);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        query = query.gte('price_level', min).lte('price_level', max);
      } else {
        query = query.gte('price_level', min);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar spots:', error);
      throw error;
    }

    // Calcular estatísticas para cada spot
    return data.map(spot => ({
      ...spot,
      averageRating: spot.spot_ratings.length > 0 ? 
        spot.spot_ratings.reduce((sum, r) => sum + r.rating, 0) / spot.spot_ratings.length : 0,
      totalRatings: spot.spot_ratings.length,
      totalPhotos: spot.spot_photos.length
    }));

  } catch (error) {
    console.error('Erro ao buscar spots:', error);
    throw error;
  }
};

// Buscar um spot específico com todos os detalhes
export const getSpotById = async (spotId) => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select(`
        *,
        spot_ratings (
          id,
          rating,
          comment,
          user_id,
          created_at,
          likes_count,
          user:user_id (name, email)
        ),
        spot_photos (
          id,
          photo_url,
          description,
          is_cover
        )
      `)
      .eq('id', spotId)
      .single();

    if (error) {
      console.error('Erro ao buscar spot:', error);
      throw error;
    }

    // Calcular estatísticas
    const averageRating = data.spot_ratings.length > 0 ? 
      data.spot_ratings.reduce((sum, r) => sum + r.rating, 0) / data.spot_ratings.length : 0;

    return {
      ...data,
      averageRating,
      totalRatings: data.spot_ratings.length,
      totalPhotos: data.spot_photos.length
    };

  } catch (error) {
    console.error('Erro ao buscar spot:', error);
    throw error;
  }
};

// Criar novo spot
export const createSpot = async (spotData, userId) => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .insert([{
        ...spotData,
        created_by: userId,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar spot:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Erro ao criar spot:', error);
    throw error;
  }
};

// Atualizar spot
export const updateSpot = async (spotId, updates, userId) => {
  try {
    // Verificar se o usuário pode editar
    const { data: spot } = await supabase
      .from('spots')
      .select('created_by')
      .eq('id', spotId)
      .single();

    if (spot.created_by !== userId) {
      throw new Error('Você não tem permissão para editar este local');
    }

    const { data, error } = await supabase
      .from('spots')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', spotId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar spot:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Erro ao atualizar spot:', error);
    throw error;
  }
};

// ===== RATINGS & REVIEWS API =====

// Adicionar avaliação
export const addRating = async (ratingData) => {
  try {
    // Verificar se já avaliou
    const { data: existingRating } = await supabase
      .from('spot_ratings')
      .select('id')
      .eq('spot_id', ratingData.spot_id)
      .eq('user_id', ratingData.user_id)
      .single();

    if (existingRating) {
      // Atualizar avaliação existente
      const { data, error } = await supabase
        .from('spot_ratings')
        .update({
          rating: ratingData.rating,
          comment: ratingData.comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select(`
          *,
          user:user_id (name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    } else {
      // Criar nova avaliação
      const { data, error } = await supabase
        .from('spot_ratings')
        .insert([{
          ...ratingData,
          likes_count: 0
        }])
        .select(`
          *,
          user:user_id (name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    }

  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    throw error;
  }
};

// Curtir/descurtir comentário
export const toggleRatingLike = async (ratingId, userId) => {
  try {
    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from('rating_likes')
      .select('id')
      .eq('rating_id', ratingId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Remover like
      await supabase
        .from('rating_likes')
        .delete()
        .eq('id', existingLike.id);

      // Decrementar contador
      const { data } = await supabase
        .rpc('decrement_rating_likes', { rating_id: ratingId });

      return { liked: false, likesCount: data };
    } else {
      // Adicionar like
      await supabase
        .from('rating_likes')
        .insert([{
          rating_id: ratingId,
          user_id: userId
        }]);

      // Incrementar contador
      const { data } = await supabase
        .rpc('increment_rating_likes', { rating_id: ratingId });

      return { liked: true, likesCount: data };
    }

  } catch (error) {
    console.error('Erro ao curtir avaliação:', error);
    throw error;
  }
};

// Responder a uma avaliação
export const replyToRating = async (replyData) => {
  try {
    const { data, error } = await supabase
      .from('rating_replies')
      .insert([replyData])
      .select(`
        *,
        user:user_id (name, email)
      `)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Erro ao responder avaliação:', error);
    throw error;
  }
};

// Buscar respostas de uma avaliação
export const getRatingReplies = async (ratingId) => {
  try {
    const { data, error } = await supabase
      .from('rating_replies')
      .select(`
        *,
        user:user_id (name, email)
      `)
      .eq('rating_id', ratingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];

  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    return [];
  }
};

// ===== PHOTOS API =====

// Upload de foto para spot
export const uploadSpotPhoto = async (file, spotId, description = '', isCover = false) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${spotId}_${Date.now()}.${fileExt}`;
    const filePath = `spots/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('spot-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('spot-images')
      .getPublicUrl(filePath);

    // Salvar referência no banco
    const { data, error } = await supabase
      .from('spot_photos')
      .insert([{
        spot_id: spotId,
        photo_url: publicUrl,
        description,
        is_cover: isCover
      }])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    throw error;
  }
};

// Deletar foto
export const deleteSpotPhoto = async (photoId, userId) => {
  try {
    // Verificar permissão
    const { data: photo } = await supabase
      .from('spot_photos')
      .select(`
        *,
        spot:spot_id (created_by)
      `)
      .eq('id', photoId)
      .single();

    if (photo.spot.created_by !== userId) {
      throw new Error('Você não tem permissão para deletar esta foto');
    }

    // Deletar do storage
    const fileName = photo.photo_url.split('/').pop();
    await supabase.storage
      .from('spot-images')
      .remove([`spots/${fileName}`]);

    // Deletar do banco
    const { error } = await supabase
      .from('spot_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
    return true;

  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    throw error;
  }
};

// ===== SEARCH & FILTERS =====

// Buscar spots por texto
export const searchSpots = async (searchTerm, filters = {}) => {
  try {
    let query = supabase
      .from('spots')
      .select(`
        *,
        spot_ratings (rating),
        spot_photos (photo_url, is_cover)
      `)
      .eq('status', 'active');

    // Busca por texto
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }

    // Aplicar outros filtros
    if (filters.category && filters.category !== 'todos') {
      query = query.eq('category', filters.category);
    }

    if (filters.region && filters.region !== 'todas') {
      query = query.eq('region', filters.region);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calcular estatísticas
    return data.map(spot => ({
      ...spot,
      averageRating: spot.spot_ratings.length > 0 ? 
        spot.spot_ratings.reduce((sum, r) => sum + r.rating, 0) / spot.spot_ratings.length : 0,
      totalRatings: spot.spot_ratings.length,
      coverPhoto: spot.spot_photos.find(p => p.is_cover)?.photo_url || spot.spot_photos[0]?.photo_url
    }));

  } catch (error) {
    console.error('Erro ao buscar spots:', error);
    throw error;
  }
};

// Constantes para categorias e regiões
export const SPOT_CATEGORIES = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'igreja', label: 'Igrejas' },
  { value: 'parque', label: 'Parques' },
  { value: 'praia', label: 'Praias' },
  { value: 'buffet', label: 'Buffets' },
  { value: 'hotel', label: 'Hotéis/Pousadas' },
  { value: 'salao', label: 'Salões de Festa' },
  { value: 'sitio', label: 'Sítios/Fazendas' },
  { value: 'urbano', label: 'Cenários Urbanos' },
  { value: 'historico', label: 'Locais Históricos' },
  { value: 'natureza', label: 'Natureza' }
];

export const SPOT_REGIONS = [
  { value: 'todas', label: 'Todas as regiões' },
  { value: 'centro', label: 'Centro' },
  { value: 'zona-norte', label: 'Zona Norte' },
  { value: 'zona-sul', label: 'Zona Sul' },
  { value: 'zona-leste', label: 'Zona Leste' },
  { value: 'zona-oeste', label: 'Zona Oeste' },
  { value: 'abc', label: 'ABC' },
  { value: 'interior', label: 'Interior' },
  { value: 'litoral', label: 'Litoral' }
];

export default {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  addRating,
  toggleRatingLike,
  replyToRating,
  getRatingReplies,
  uploadSpotPhoto,
  deleteSpotPhoto,
  searchSpots,
  SPOT_CATEGORIES,
  SPOT_REGIONS
};