import { supabase } from '@/lib/supabaseClient';

export const getGoogleAuthUrl = async (userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('google-generate-auth-url', {
      body: { userId }
    });
    if (error) throw error;
    if (data && data.authUrl) {
      return { authUrl: data.authUrl };
    }
    throw new Error("URL de autenticação não recebida da função.");
  } catch (error) {
    console.error("Erro ao obter URL de autenticação do Google:", error);
    return { error: error.message }; 
  }
};

export const exchangeCodeForTokens = async (code) => {
  try {
    const { data, error } = await supabase.functions.invoke('google-exchange-code', {
      body: { code },
    });
    if (error) throw error;
    if (data && data.tokens) {
      return data.tokens;
    }
    throw new Error(data.error || "Falha ao trocar código por tokens na função.");
  } catch (error) {
    console.error("Erro ao trocar código por tokens:", error);
    throw error;
  }
};

export const listGoogleCalendarEvents = async (accessToken, calendarId = 'primary') => {
  try {
    const { data, error } = await supabase.functions.invoke('google-list-calendar-events', {
      body: { accessToken, calendarId },
    });
    if (error) throw error;
    return data.events || [];
  } catch (error) {
    console.error("Erro ao listar eventos do Google Calendar:", error);
    if (error.message.includes("Request failed with status code 401") || error.message.includes("invalid_grant")) {
      throw new Error("Token de acesso inválido ou expirado. Por favor, autentique novamente.");
    }
    throw error;
  }
};

export const createGoogleCalendarEvent = async (accessToken, eventDetails, calendarId = 'primary') => {
   try {
    const { data, error } = await supabase.functions.invoke('google-create-calendar-event', {
      body: { accessToken, eventDetails, calendarId },
    });
    if (error) throw error;
    return data.event;
  } catch (error) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    throw error;
  }
};

export const updateGoogleCalendarEvent = async (accessToken, eventId, eventDetails, calendarId = 'primary') => {
  try {
    const { data, error } = await supabase.functions.invoke('google-update-calendar-event', {
      body: { accessToken, eventId, eventDetails, calendarId },
    });
    if (error) throw error;
    return data.event;
  } catch (error) {
    console.error("Erro ao atualizar evento no Google Calendar:", error);
    throw error;
  }
};

export const deleteGoogleCalendarEvent = async (accessToken, eventId, calendarId = 'primary') => {
  try {
    const { data, error } = await supabase.functions.invoke('google-delete-calendar-event', {
      body: { accessToken, eventId, calendarId },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao deletar evento no Google Calendar:", error);
    throw error;
  }
};

export const refreshGoogleAccessToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.functions.invoke('google-refresh-token', {
      body: { refreshToken },
    });
    if (error) throw error;
    if (data && data.newTokens) {
      return { newTokens: data.newTokens }; 
    }
    throw new Error(data.error || "Falha ao atualizar token de acesso na função.");
  } catch (error) {
    console.error("Erro ao atualizar token de acesso:", error);
    return { error: error.message };
  }
};