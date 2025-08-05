import { supabase } from '@/lib/supabaseClient';

export const addWorkflowCard = async (supabaseClient, userId, card, userName) => {
  const newCard = {
    ...card,
    user_id: userId,
    client_id: card.client_id || null,
    service_package_id: card.service_package_id || null,
    comments: card.comments || [],
    history: card.history && card.history.length > 0 ? card.history : [{ action: 'Criado', date: new Date().toISOString(), user: userName }],
    created_at: new Date().toISOString(),
    order: card.order !== undefined ? card.order : 0,
    subtasks: (card.subtasks || []).filter(st => st.text).map(st => ({ id: st.id || Math.random().toString(36).substr(2, 9), text: st.text, completed: st.completed })),
    contract_status: card.contract_status || 'pending',
    archived: card.archived || false,
    status: card.status || 'novo-lead', 
    time: card.time || null, 
    installments: card.installments || card.num_installments || null,
    num_installments: card.num_installments || card.installments || null,
    date: card.date || null,
  };
  
  delete newCard.createFinancialTransaction;

  const { data, error } = await supabaseClient
    .from('workflow_cards')
    .insert([newCard])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateWorkflowCard = async (supabaseClient, userId, id, updates, currentCard, getStatusLabelFn, userName) => {
  if (!currentCard) {
    console.warn(`Tentativa de atualizar card ${id} que não foi encontrado no estado local.`);
    const { data: fallbackCard, error: fetchError } = await supabaseClient.from('workflow_cards').select('*').eq('id', id).single();
    if (fetchError || !fallbackCard) {
        throw new Error(`Card com ID ${id} não encontrado para atualização, nem no estado local nem no banco de dados.`);
    }
    currentCard = fallbackCard;
  }
  
  let newHistory = [...(currentCard.history || [])]; 
  
  const fieldsToTrack = {
    title: "Título",
    status: "Status",
    value: "Valor",
    date: "Data",
    time: "Hora",
    description: "Descrição",
    client_id: "Cliente",
    service_package_id: "Pacote de Serviço",
    payment_status: "Status do Pagamento",
    contract_status: "Status do Contrato",
  };

  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key) && fieldsToTrack[key] && updates[key] !== currentCard[key]) {
      let fromValue = currentCard[key] || 'vazio';
      let toValue = updates[key] || 'vazio';

      if (key === 'status') {
        fromValue = getStatusLabelFn(fromValue);
        toValue = getStatusLabelFn(toValue);
      }
      
      if (key === 'value') {
        fromValue = `R$ ${Number(fromValue).toFixed(2)}`;
        toValue = `R$ ${Number(toValue).toFixed(2)}`;
      }

      if (fromValue !== toValue) {
        newHistory.push({
          action: `${fieldsToTrack[key]} alterado de "${fromValue}" para "${toValue}"`,
          date: new Date().toISOString(),
          user: userName,
        });
      }
    }
  }

  if (updates.archived === true && currentCard.archived === false) {
    newHistory.push({ action: "Card arquivado", date: new Date().toISOString(), user: userName });
  } else if (updates.archived === false && currentCard.archived === true) {
    newHistory.push({ action: "Card desarquivado", date: new Date().toISOString(), user: userName });
  }

  const dataToUpdate = {
    ...updates,
    client_id: updates.client_id === '' ? null : updates.client_id,
    service_package_id: updates.service_package_id === '' ? null : updates.service_package_id,
    history: newHistory,
    subtasks: updates.subtasks !== undefined 
      ? (updates.subtasks || []).map(st => ({ id: st.id || Math.random().toString(36).substr(2, 9), text: st.text, completed: st.completed })) 
      : (currentCard.subtasks || []).map(st => ({ id: st.id || Math.random().toString(36).substr(2, 9), text: st.text, completed: st.completed })),
    comments: updates.comments !== undefined ? updates.comments : currentCard.comments,
    contract_status: updates.contract_status !== undefined ? updates.contract_status : currentCard.contract_status,
    archived: updates.archived !== undefined ? updates.archived : currentCard.archived,
    time: updates.time !== undefined ? updates.time : currentCard.time,
    installments: updates.installments !== undefined ? updates.installments : (updates.num_installments !== undefined ? updates.num_installments : currentCard.installments),
    num_installments: updates.num_installments !== undefined ? updates.num_installments : (updates.installments !== undefined ? updates.installments : currentCard.num_installments),
    date: updates.date !== undefined ? updates.date : currentCard.date,
  };
  
  delete dataToUpdate.createFinancialTransaction;
  
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) {
      delete dataToUpdate[key];
    }
  });

  const { data, error } = await supabaseClient
    .from('workflow_cards')
    .update(dataToUpdate)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteWorkflowCard = async (supabaseClient, userId, id) => {
  const { error } = await supabaseClient
    .from('workflow_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const addCommentToWorkflowCard = async (supabaseClient, userId, cardId, commentText, existingComments, userName, userPhotoUrl) => {
  const commentsArray = Array.isArray(existingComments) ? existingComments : [];
  
  const newCommentEntry = {
    id: Math.random().toString(36).substr(2, 9), 
    text: commentText,
    date: new Date().toISOString(),
    user: userName,
    user_photo_url: userPhotoUrl
  };
  const updatedComments = [...commentsArray, newCommentEntry];
  
  let cardResult = await supabaseClient.from('workflow_cards').select('history').eq('id', cardId).eq('user_id', userId).single();
  if (cardResult.error) throw cardResult.error;
  let currentHistory = cardResult.data?.history || [];
  currentHistory.push({ action: `Comentário adicionado: "${commentText.substring(0,30)}${commentText.length > 30 ? '...' : ''}"`, date: new Date().toISOString(), user: userName });

  const { data, error } = await supabaseClient
    .from('workflow_cards')
    .update({ comments: updatedComments, history: currentHistory })
    .eq('id', cardId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};