import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  FileSpreadsheet,
  Database,
  MapPin,
  MessageSquare,
  Lightbulb,
  Calendar,
  Target,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/authContext';

const DataManagementPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('spots');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importData, setImportData] = useState('');

  // Estados para diferentes tipos de dados
  const [spotData, setSpotData] = useState({
    name: '',
    category: 'parque',
    region: 'centro',
    description: '',
    address: '',
    price_level: 2,
    phone: '',
    website: ''
  });

  const [respostaData, setRespostaData] = useState({
    title: '',
    category: 'whatsapp',
    message: '',
    tags: ''
  });

  const [inspiraData, setInspiraData] = useState({
    title: '',
    category: 'casamento',
    description: '',
    season: 'todas',
    style: '',
    tips: ''
  });

  const [seasonData, setSeasonData] = useState({
    month: 1,
    season_name: '',
    description: '',
    opportunities: '',
    tips: ''
  });

  const [marketData, setMarketData] = useState({
    region: '',
    service_type: '',
    average_price: '',
    min_price: '',
    max_price: '',
    competition_level: 'Médio'
  });

  // Verificar se é admin
  useEffect(() => {
    if (!user || user.email !== 'admin@gofotografo.com') {
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  // Configurações por tipo de dados
  const dataTypes = {
    spots: {
      title: 'Locais (SPOT)',
      description: 'Gerencie locais para ensaios fotográficos',
      icon: MapPin,
      tableName: 'spots',
      fields: [
        { key: 'name', label: 'Nome', type: 'text' },
        { key: 'category', label: 'Categoria', type: 'select', options: ['parque', 'igreja', 'praia', 'buffet', 'hotel', 'salao', 'sitio', 'urbano', 'historico', 'natureza'] },
        { key: 'region', label: 'Região', type: 'select', options: ['centro', 'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste', 'abc', 'interior', 'litoral'] },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'address', label: 'Endereço', type: 'text' },
        { key: 'price_level', label: 'Nível de Preço (1-5)', type: 'number', min: 1, max: 5 },
        { key: 'phone', label: 'Telefone', type: 'text' },
        { key: 'website', label: 'Website', type: 'url' }
      ]
    },
    respostas: {
      title: 'Respostas Rápidas',
      description: 'Templates de respostas para WhatsApp, Email, etc.',
      icon: MessageSquare,
      tableName: 'quick_responses',
      fields: [
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'category', label: 'Categoria', type: 'select', options: ['whatsapp', 'email', 'instagram', 'facebook', 'telefone'] },
        { key: 'message', label: 'Mensagem', type: 'textarea' },
        { key: 'tags', label: 'Tags (separadas por vírgula)', type: 'text' }
      ]
    },
    inspira: {
      title: 'Ideias Criativas (INSPIRA)',
      description: 'Central de ideias para ensaios fotográficos',
      icon: Lightbulb,
      tableName: 'creative_ideas',
      fields: [
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'category', label: 'Categoria', type: 'select', options: ['casamento', 'ensaio', 'familia', 'gestante', 'newborn', 'infantil', 'formatura', 'corporativo'] },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'season', label: 'Temporada', type: 'select', options: ['primavera', 'verao', 'outono', 'inverno', 'todas'] },
        { key: 'style', label: 'Estilo', type: 'text' },
        { key: 'tips', label: 'Dicas e Props', type: 'textarea' }
      ]
    },
    season: {
      title: 'Dados Sazonais',
      description: 'Oportunidades e dicas por época do ano',
      icon: Calendar,
      tableName: 'seasonal_data',
      fields: [
        { key: 'month', label: 'Mês (1-12)', type: 'number', min: 1, max: 12 },
        { key: 'season_name', label: 'Nome da Estação/Época', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'opportunities', label: 'Oportunidades', type: 'textarea' },
        { key: 'tips', label: 'Dicas e Estratégias', type: 'textarea' }
      ]
    },
    market: {
      title: 'Dados de Mercado',
      description: 'Preços e dados de mercado por região/serviço',
      icon: BarChart3,
      tableName: 'market_data',
      fields: [
        { key: 'region', label: 'Região', type: 'text' },
        { key: 'service_type', label: 'Tipo de Serviço', type: 'select', options: ['casamento', 'ensaio', 'corporativo', 'evento', 'produto', 'gestante', 'newborn', 'familia'] },
        { key: 'average_price', label: 'Preço Médio (R$)', type: 'number' },
        { key: 'min_price', label: 'Preço Mínimo (R$)', type: 'number' },
        { key: 'max_price', label: 'Preço Máximo (R$)', type: 'number' },
        { key: 'competition_level', label: 'Nível de Concorrência', type: 'select', options: ['Baixo', 'Médio', 'Alto'] }
      ]
    }
  };

  const currentDataType = dataTypes[activeTab];

  const handleCSVImport = (csvText) => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const item = {};
        
        headers.forEach((header, index) => {
          item[header] = values[index]?.trim() || '';
        });
        
        data.push(item);
      }

      return data;
    } catch (error) {
      throw new Error('Formato de CSV inválido');
    }
  };

  const handleBulkImport = async () => {
    if (!importData.trim()) {
      toast({
        title: 'Erro',
        description: 'Cole os dados CSV para importar.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const parsedData = handleCSVImport(importData);
      
      // Simular importação (normalmente salvaria no banco)
      console.log('Dados para importar:', parsedData);
      
      toast({
        title: 'Importação realizada!',
        description: `${parsedData.length} itens importados com sucesso.`,
      });
      
      setImportData('');
      loadData();
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Gerar CSV dos dados atuais
    if (data.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há dados para exportar.',
        variant: 'destructive'
      });
      return;
    }

    const headers = currentDataType.fields.map(field => field.key);
    const csvContent = [
      headers.join(','),
      ...data.map(item => headers.map(header => item[header] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exportação realizada!',
      description: 'Arquivo CSV baixado com sucesso.',
    });
  };

  const loadData = () => {
    // Simular carregamento de dados
    setLoading(true);
    setTimeout(() => {
      setData([
        // Dados de exemplo baseados no tipo selecionado
        ...(activeTab === 'spots' ? [
          { 
            id: 1, 
            name: 'Parque Ibirapuera', 
            category: 'parque', 
            region: 'zona-sul',
            description: 'Grande parque urbano com diversos cenários',
            address: 'Av. Paulista, 1578',
            price_level: 1,
            phone: '(11) 99999-9999',
            website: 'https://parqueibirapuera.org'
          }
        ] : []),
        ...(activeTab === 'respostas' ? [
          {
            id: 1,
            title: 'Primeira resposta - WhatsApp',
            category: 'whatsapp',
            message: 'Olá! Obrigado pelo interesse nos nossos serviços.',
            tags: 'contato, whatsapp, primeira'
          }
        ] : [])
      ]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const getCurrentFormData = () => {
    switch (activeTab) {
      case 'spots': return spotData;
      case 'respostas': return respostaData;
      case 'inspira': return inspiraData;
      case 'season': return seasonData;
      case 'market': return marketData;
      default: return {};
    }
  };

  const setCurrentFormData = (data) => {
    switch (activeTab) {
      case 'spots': setSpotData(data); break;
      case 'respostas': setRespostaData(data); break;
      case 'inspira': setInspiraData(data); break;
      case 'season': setSeasonData(data); break;
      case 'market': setMarketData(data); break;
    }
  };

  const renderFormField = (field) => {
    const value = getCurrentFormData()[field.key] || '';
    
    const handleChange = (newValue) => {
      setCurrentFormData({
        ...getCurrentFormData(),
        [field.key]: newValue
      });
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select 
            className="w-full p-2 border rounded-lg bg-background"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          >
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            min={field.min}
            max={field.max}
          />
        );
      
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 fixed inset-0 overflow-auto">
      <div className="space-y-6 p-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Database className="w-8 h-8 text-slate-600" />
            Painel Administrativo - Gestão de Dados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie dados para todas as funcionalidades do sistema
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {Object.entries(dataTypes).map(([key, type]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(dataTypes).map(([key, type]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-6">
                {/* Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="w-5 h-5" />
                      {type.title}
                    </CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                      <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button variant="outline" onClick={() => document.getElementById(`import-${key}`).click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Importar CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Formulário de Importação */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Importação em Lote (CSV)</CardTitle>
                    <CardDescription>
                      Cole aqui o conteúdo CSV para importar múltiplos itens de uma vez
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Cole aqui o conteúdo CSV..."
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleBulkImport} disabled={loading}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          {loading ? 'Importando...' : 'Importar Dados'}
                        </Button>
                        <Button variant="outline" onClick={() => setImportData('')}>
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formulário de Adição/Edição */}
                {showAddForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {editingItem ? 'Editar' : 'Adicionar'} {type.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {type.fields.map((field) => (
                          <div key={field.key}>
                            <Label htmlFor={field.key}>{field.label}</Label>
                            {renderFormField(field)}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button onClick={() => {
                          // Simular salvamento
                          toast({
                            title: editingItem ? 'Item atualizado!' : 'Item criado!',
                            description: 'Operação realizada com sucesso.'
                          });
                          setShowAddForm(false);
                          setEditingItem(null);
                          loadData();
                        }}>
                          {editingItem ? 'Atualizar' : 'Salvar'}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowAddForm(false);
                          setEditingItem(null);
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tabela de Dados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Existentes</CardTitle>
                    <CardDescription>
                      {data.length} itens encontrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Carregando...</div>
                    ) : data.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {type.fields.slice(0, 4).map((field) => (
                              <TableHead key={field.key}>{field.label}</TableHead>
                            ))}
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.map((item) => (
                            <TableRow key={item.id}>
                              {type.fields.slice(0, 4).map((field) => (
                                <TableCell key={field.key}>
                                  {field.type === 'textarea' 
                                    ? (item[field.key] || '').substring(0, 50) + '...'
                                    : item[field.key] || '-'
                                  }
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setEditingItem(item);
                                    setCurrentFormData(item);
                                    setShowAddForm(true);
                                  }}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => {
                                    toast({
                                      title: 'Item removido!',
                                      description: 'Item deletado com sucesso.'
                                    });
                                    loadData();
                                  }}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum item encontrado. Adicione alguns dados para começar.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default DataManagementPage;