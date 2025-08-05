import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';

const PublicFormPage = () => {
  const { formId: shareableId } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      if (!shareableId) return;
      setLoading(true);
      try {
        const { data: formData, error: formError } = await supabase
          .from('client_forms')
          .select('*')
          .eq('shareable_link_id', shareableId)
          .single();
        if (formError) throw new Error("Formulário não encontrado ou inválido.");
        setForm(formData);

        const { data: questionsData, error: questionsError } = await supabase
          .from('form_questions')
          .select('*')
          .eq('form_id', formData.id)
          .order('order', { ascending: true });
        if (questionsError) throw questionsError;
        setQuestions(questionsData);
      } catch (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [shareableId, toast]);

  const handleAnswerChange = (questionText, value) => {
    setAnswers(prev => ({ ...prev, [questionText]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    for (const q of questions) {
      if (q.is_required && !answers[q.question_text]?.trim()) {
        toast({ title: "Campo obrigatório", description: `A pergunta "${q.question_text}" precisa ser respondida.`, variant: "destructive" });
        setSubmitting(false);
        return;
      }
    }

    try {
      const { error } = await supabase.functions.invoke('submit-client-form', {
        body: JSON.stringify({ formId: form.id, answers, userId: form.user_id }),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!form) {
    return <div className="min-h-screen flex items-center justify-center bg-muted text-destructive">Formulário não encontrado.</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4" style={{ backgroundImage: `url(${form.background_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-2xl w-full bg-card/80 backdrop-blur-lg p-8 rounded-lg shadow-lg text-center border border-border">
          <h1 className="text-3xl font-bold text-primary mb-4">Obrigado!</h1>
          <p className="text-muted-foreground">Suas respostas foram enviadas com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4" style={{ backgroundImage: `url(${form.background_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="max-w-2xl mx-auto bg-card/80 backdrop-blur-lg p-8 rounded-lg shadow-lg border border-border">
        {form.logo_url && (
          <div className="text-center mb-8">
            <img src={form.logo_url} alt="Logo" className="max-h-24 mx-auto" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-foreground mb-2">{form.title}</h1>
        <p className="text-muted-foreground mb-8">{form.description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map(q => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-foreground mb-1">
                {q.question_text}
                {q.is_required && <span className="text-destructive ml-1">*</span>}
              </label>
              {q.question_type === 'long_text' ? (
                <Textarea
                  value={answers[q.question_text] || ''}
                  onChange={(e) => handleAnswerChange(q.question_text, e.target.value)}
                  required={q.is_required}
                  rows={4}
                  className="bg-background/70"
                />
              ) : (
                <Input
                  type={q.question_type === 'email' ? 'email' : q.question_type === 'phone' ? 'tel' : 'text'}
                  value={answers[q.question_text] || ''}
                  onChange={(e) => handleAnswerChange(q.question_text, e.target.value)}
                  required={q.is_required}
                  className="bg-background/70"
                />
              )}
            </div>
          ))}
          <Button type="submit" disabled={submitting} className="w-full btn-custom-gradient text-white">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar Respostas
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PublicFormPage;