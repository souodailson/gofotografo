import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bug, Filter, Loader2, Code, FileText, Copy, Check, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import duotoneDark from 'react-syntax-highlighter/dist/esm/styles/prism/duotone-dark';
const statusColors = {
  'Aberto': 'bg-red-500',
  'Em análise': 'bg-yellow-500',
  'Resolvido': 'bg-green-500',
};

const typeColors = {
  'error': 'text-red-400',
  'log': 'text-blue-400',
  'network_error': 'text-orange-400',
  'unhandled_rejection': 'text-purple-400',
};

const LogItem = ({ log, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isStackCopied, setIsStackCopied] = useState(false);

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (newStatus) => {
    onUpdate(log.id, { status: newStatus });
  };
  
  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim()) return;
    const updatedAnnotations = `${log.annotations || ''}\n[${new Date().toLocaleString('pt-BR')}] ${newAnnotation}`;
    onUpdate(log.id, { annotations: updatedAnnotations });
    setNewAnnotation('');
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300">
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className={`font-mono text-sm truncate ${typeColors[log.type] || 'text-gray-300'}`}>{log.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="font-semibold">{log.route || '/'}</span> em {format(parseISO(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Badge variant="outline" className={`border-none text-white text-xs ${statusColors[log.status] || 'bg-gray-500'}`}>{log.status}</Badge>
            <Badge variant="secondary">{log.type}</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-800/50 p-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Informações do Usuário</h4>
              <p className="text-sm text-gray-400"><strong>Nome:</strong> {log.user_info?.name || 'N/A'}</p>
              <p className="text-sm text-gray-400"><strong>Email:</strong> {log.user_info?.email || 'N/A'}</p>
              <p className="text-sm text-gray-400"><strong>ID:</strong> {log.user_id || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Informações do Dispositivo</h4>
              <p className="text-sm text-gray-400"><strong>Navegador:</strong> {log.device_info?.browser || 'N/A'}</p>
              <p className="text-sm text-gray-400"><strong>SO:</strong> {log.device_info?.platform || 'N/A'}</p>
              <p className="text-sm text-gray-400"><strong>Resolução:</strong> {log.device_info?.screen_resolution || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-gray-200">Mensagem Completa</h4>
               <Button variant="ghost" size="sm" onClick={() => handleCopy(log.message, setIsCopied)}>
                {isCopied ? <Check size={14} className="text-green-500 mr-2" /> : <Copy size={14} className="mr-2" />}
                Copiar
              </Button>
            </div>
            <pre className="text-sm bg-gray-900 p-3 rounded-md text-gray-300 max-h-40 overflow-y-auto">{log.message}</pre>
          </div>

          {log.stack_trace && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                 <h4 className="font-semibold text-gray-200">Stack Trace</h4>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(log.stack_trace, setIsStackCopied)}>
                  {isStackCopied ? <Check size={14} className="text-green-500 mr-2" /> : <Copy size={14} className="mr-2" />}
                  Copiar
                </Button>
              </div>
              <SyntaxHighlighter
  language="javascript"
  style={duotoneDark}
  customStyle={{ margin: 0, maxHeight: '250px', overflowY: 'auto' }}
>
  {String(log.stack_trace)}
</SyntaxHighlighter>

            </div>
          )}

          <div className="mt-6">
            <h4 className="font-semibold text-gray-200 mb-2">Ações</h4>
            <div className="flex items-center gap-4">
              <span>Mudar Status:</span>
              <Select value={log.status} onValueChange={handleUpdateStatus}>
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Mudar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em análise">Em análise</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-200 mb-2">Anotações</h4>
            <div className="bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto mb-2">
              <pre className="text-sm text-gray-400 whitespace-pre-wrap">{log.annotations || 'Nenhuma anotação.'}</pre>
            </div>
            <div className="flex gap-2">
                <Textarea 
                    placeholder="Adicionar nova anotação..." 
                    value={newAnnotation}
                    onChange={e => setNewAnnotation(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={handleAddAnnotation}><MessageSquare size={16} /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminBugsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'Aberto', type: 'all', searchTerm: '', dateRange: 'all' });
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('error_logs').select('*').order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.searchTerm) {
        query = query.or(`message.ilike.%${filters.searchTerm}%,route.ilike.%${filters.searchTerm}%,user_info->>email.ilike.%${filters.searchTerm}%`);
      }
      // Date filter logic can be added here

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data);
    } catch (error) {
      toast({ title: 'Erro ao buscar logs', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const handleUpdateLog = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('error_logs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        setLogs(prev => prev.map(log => log.id === id ? data : log));
        toast({ title: "Log atualizado com sucesso!" });

    } catch (error) {
        toast({ title: "Erro ao atualizar log", description: error.message, variant: 'destructive'});
    }
  };


  return (
    <div className="container mx-auto p-4 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Bug size={32} /> Monitoramento de Bugs</h1>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white"><Filter /> Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Buscar por mensagem, rota, usuário..."
            value={filters.searchTerm}
            onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Select value={filters.status} onValueChange={value => setFilters(f => ({ ...f, status: value }))}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Em análise">Em análise</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={value => setFilters(f => ({ ...f, type: value }))}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="log">Log</SelectItem>
              <SelectItem value="network_error">Network Error</SelectItem>
              <SelectItem value="unhandled_rejection">Unhandled Rejection</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchLogs}>Aplicar Filtros</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {logs.length > 0 ? logs.map(log => (
            <LogItem key={log.id} log={log} onUpdate={handleUpdateLog} />
          )) : <p className="text-center text-gray-400 py-8">Nenhum log encontrado com os filtros atuais.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminBugsPage;