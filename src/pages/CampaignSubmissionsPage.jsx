import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CampaignSubmissionsPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useData();
  const { toast } = useToast();

  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data: formData, error: formError } = await supabase
          .from('client_forms')
          .select('*')
          .eq('id', formId)
          .single();

        if (formError || !formData) throw new Error("Formulário não encontrado.");
        setForm(formData);
        
        let submissionData, submissionError;

        if (formData.form_type === 'feedback') {
          ({ data: submissionData, error: submissionError } = await supabase
            .from('feedback_submissions')
            .select('*')
            .eq('form_id', formId)
            .order('created_at', { ascending: false }));
        } else {
          ({ data: submissionData, error: submissionError } = await supabase
            .from('lead_submissions')
            .select('*')
            .eq('form_id', formId)
            .order('created_at', { ascending: false }));
        }

        if (submissionError) throw submissionError;
        setSubmissions(submissionData || []);

      } catch (error) {
        toast({ title: "Erro ao buscar dados", description: error.message, variant: "destructive" });
        navigate('/forms');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formId, user, toast, navigate]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Respostas para: ${form.title}`, 14, 16);
    
    const tableColumn = ["Data de Envio", "Respostas"];
    const tableRows = [];

    submissions.forEach(sub => {
        const submissionDate = format(new Date(sub.created_at), 'dd/MM/yyyy HH:mm');
        const answersText = Object.entries(sub.answers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
            
        const submissionData = [
            submissionDate,
            answersText
        ];
        tableRows.push(submissionData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: {
            valign: 'middle'
        },
        headStyles: {
            fillColor: [22, 163, 74]
        },
        columnStyles: {
            1: { cellWidth: 'auto' }
        }
    });
    doc.save(`respostas_${form.title.replace(/\s+/g, '_')}.pdf`);
  }

  if (loading) return <div>Carregando respostas...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate('/forms')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold mt-2 titulo-gradiente">{form?.title}</h1>
          <p className="text-muted-foreground">{submissions.length} respostas recebidas</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportToPDF}>
                <Download className="w-4 h-4 mr-2"/>
                Exportar PDF
            </Button>
            {form?.form_type !== 'feedback' && (
                 <Button onClick={() => navigate('/clients')}>
                    <UserPlus className="w-4 h-4 mr-2"/>
                    Ver Leads como Clientes
                </Button>
            )}
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-md border">
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="border-b pb-4 last:border-b-0">
                <p className="text-sm text-muted-foreground mb-2">
                  Recebido em: {format(new Date(sub.created_at), 'dd/MM/yyyy \'às\' HH:mm')}
                </p>
                <div className="space-y-1">
                  {Object.entries(sub.answers).map(([question, answer]) => (
                    <div key={question}>
                      <p className="font-semibold text-foreground">{question}:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{String(answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma resposta para este formulário ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignSubmissionsPage;