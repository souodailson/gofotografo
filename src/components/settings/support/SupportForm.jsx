import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

const SupportForm = ({ type, onSubmit, isSubmitting }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'support' && (!subject || !message)) {
      alert('Por favor, preencha o assunto e a mensagem.');
      return;
    }
    if (type === 'suggestion' && !message) {
      alert('Por favor, escreva sua sugestão.');
      return;
    }
    onSubmit({ type, subject, message });
    setSubject('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {type === 'support' && (
        <div>
          <label htmlFor="support-subject" className="block text-sm font-medium text-muted-foreground mb-1">Assunto</label>
          <Input id="support-subject" type="text" placeholder="Ex: Dúvida sobre faturamento" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
      )}
      <div>
        <label htmlFor={`${type}-message`} className="block text-sm font-medium text-muted-foreground mb-1">
          {type === 'support' ? 'Descreva seu problema' : 'Sua sugestão'}
        </label>
        <Textarea
          id={`${type}-message`}
          placeholder={type === 'support' ? 'Detalhe sua dúvida ou problema aqui...' : 'Como podemos melhorar o GO.FOTÓGRAFO?'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
        />
      </div>
      <Button type="submit" className="w-full btn-custom-gradient text-white" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
};

export default SupportForm;