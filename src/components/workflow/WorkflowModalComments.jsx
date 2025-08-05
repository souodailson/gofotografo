import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Info, Send } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const WorkflowModalComments = ({ comments, onAddComment, cardExists, onAfterComment }) => {
  const [newComment, setNewComment] = useState('');
  const { settings } = useData();

  const handleInternalAddComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment('');
    if (onAfterComment) {
      onAfterComment();
    }
  };

  if (!cardExists) {
    return (
      <div className="text-center p-4 text-slate-500 dark:text-slate-400">
          <Info size={24} className="mx-auto mb-2" />
          Salve o card primeiro para adicionar ou ver comentários.
      </div>
    );
  }

  const getUserInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin p-1">
        {comments && comments.length > 0 ? (
          comments.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map((comment) => (
            <div key={comment.id || comment.date} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user_photo_url} alt={comment.user} />
                <AvatarFallback>{getUserInitials(comment.user)}</AvatarFallback>
              </Avatar>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{comment.user}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        ) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhum comentário ainda.</p>}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-start space-x-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={settings?.profile_photo} alt={settings?.user_name} />
          <AvatarFallback>{getUserInitials(settings?.user_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            className="flex-1" 
            placeholder="Adicionar comentário..." 
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleInternalAddComment();
              }
            }}
          />
          <Button onClick={handleInternalAddComment} size="sm" className="mt-2"><Send className="w-4 h-4 mr-2" />Enviar</Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModalComments;