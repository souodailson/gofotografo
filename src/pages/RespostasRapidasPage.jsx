import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Search, 
  Copy, 
  Edit,
  Plus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Camera,
  Heart,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RespostasRapidasPage = () => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('whatsapp');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ title: '', message: '', category: 'whatsapp' });
  const [showNewForm, setShowNewForm] = useState(false);

  // Templates pré-definidos
  const templates = {
    whatsapp: [
      {
        id: 'wpp1',
        title: 'Primeiro Contato - Orçamento',
        category: 'orcamento',
        message: `Olá! 😊

Muito obrigado(a) pelo interesse no meu trabalho!

Para elaborar um orçamento personalizado, preciso de algumas informações:
📅 Data do evento
📍 Local
⏰ Horário de início
🎯 Tipo de evento (casamento, ensaio, formatura, etc.)
⏱️ Duração estimada

Tenho pacotes a partir de R$ [VALOR] que incluem:
✅ [X] horas de cobertura
✅ [X] fotos tratadas
✅ Galeria online
✅ [Outros itens]

Você tem disponibilidade para conversarmos por telefone ou podemos prosseguir por aqui mesmo?

Aguardo seu retorno! 📸`,
        tags: ['primeiro contato', 'orçamento', 'informações']
      },
      {
        id: 'wpp2',
        title: 'Confirmação de Agendamento',
        category: 'agendamento',
        message: `Perfeito! ✨

Seu ensaio está confirmado para:
📅 [DATA]
⏰ [HORÁRIO]
📍 [LOCAL]

*Informações importantes:*
• Chegue 15 minutos antes
• Traga as roupas que combinamos
• [Orientações específicas]

💰 *Valor:* R$ [VALOR]
💳 *Forma de pagamento:* [FORMA]

Qualquer dúvida, estou aqui!
Mal posso esperar para registrar momentos especiais com vocês! 📸❤️`,
        tags: ['confirmação', 'agendamento', 'detalhes']
      },
      {
        id: 'wpp3',
        title: 'Entrega de Fotos',
        category: 'entrega',
        message: `Olá! 📸✨

As fotos do seu ensaio estão prontas! 🎉

Você pode acessar a galeria completa através do link:
🔗 [LINK DA GALERIA]
🔐 Senha: [SENHA]

📝 *Detalhes da entrega:*
• [X] fotos selecionadas e editadas
• Resolução alta para impressão
• Galeria fica disponível por 60 dias
• Download ilimitado

Espero que gostem muito do resultado! 
Não esqueçam de me marcar quando postarem nas redes sociais! 😍

Qualquer dúvida, estou aqui!`,
        tags: ['entrega', 'galeria', 'fotos prontas']
      },
      {
        id: 'wpp4',
        title: 'Reagendamento',
        category: 'reagendamento',
        message: `Oi! 😊

Entendo perfeitamente a necessidade de reagendar. Não tem problema!

Vou verificar minha agenda e te passo as datas disponíveis:

*Opções disponíveis:*
📅 [DATA 1] - [HORÁRIO]
📅 [DATA 2] - [HORÁRIO]  
📅 [DATA 3] - [HORÁRIO]

O valor e demais condições permanecem as mesmas. 
Qual dessas datas funciona melhor para vocês?

Aguardo retorno! 📸`,
        tags: ['reagendamento', 'flexibilidade', 'novas datas']
      },
      {
        id: 'wpp5',
        title: 'Dúvidas Frequentes',
        category: 'duvidas',
        message: `Olá! 😊 Aqui estão as respostas para as dúvidas mais comuns:

*⏱️ Quantas fotos recebo?*
Você recebe [X] fotos selecionadas e editadas

*📱 Posso escolher as fotos?*
Eu faço a seleção das melhores, mas se houver alguma específica que queira, me avise!

*⏰ Qual o prazo de entrega?*
[X] dias úteis após o ensaio

*🌧️ E se chover?*
Reagendamos sem custo adicional

*💰 Formas de pagamento?*
PIX, cartão ou dinheiro

Mais alguma dúvida? Estou aqui! 📸`,
        tags: ['dúvidas', 'FAQ', 'informações gerais']
      }
    ],
    email: [
      {
        id: 'email1',
        title: 'Orçamento Formal',
        category: 'orcamento',
        message: `Assunto: Orçamento para Sessão Fotográfica

Prezado(a) [NOME],

Agradeço o interesse em meu trabalho fotográfico.

Com base nas informações fornecidas, seguem os detalhes do orçamento:

**DADOS DO EVENTO:**
• Data: [DATA]
• Local: [LOCAL]
• Tipo: [TIPO]
• Duração: [DURAÇÃO]

**PACOTE SUGERIDO:**
• [X] horas de cobertura
• [X] fotos editadas em alta resolução
• Galeria online por 60 dias
• [Outros itens inclusos]

**INVESTIMENTO:** R$ [VALOR]

**CONDIÇÕES:**
• 50% na confirmação
• 50% no dia do evento
• Formas de pagamento: PIX, cartão ou transferência

Este orçamento tem validade de 15 dias.

Estou à disposição para esclarecer dúvidas.

Atenciosamente,
[SEU NOME]
[TELEFONE]`,
        tags: ['formal', 'orçamento', 'detalhes', 'profissional']
      },
      {
        id: 'email2',
        title: 'Agradecimento Pós-Evento',
        category: 'agradecimento',
        message: `Assunto: Obrigado(a) pela confiança! 💕

Olá [NOME]!

Espero que estejam bem!

Queria agradecer imensamente pela oportunidade de registrar momentos tão especiais com vocês. Foi uma alegria enorme fazer parte deste dia único!

**PRÓXIMOS PASSOS:**
• As fotos estarão prontas em [X] dias úteis
• Vocês receberão o link da galeria por e-mail
• Qualquer dúvida, estou sempre disponível

Mal posso esperar para que vejam o resultado! 📸✨

Se gostarem do trabalho, ficaria muito grata se pudessem:
• Deixar uma avaliação no Google
• Me recomendar para amigos e família
• Me marcar nas redes sociais quando postarem

Um grande abraço e muito obrigado(a) novamente!

[SEU NOME]`,
        tags: ['agradecimento', 'pós-evento', 'próximos passos']
      }
    ],
    instagram: [
      {
        id: 'insta1',
        title: 'Resposta a Comentário',
        category: 'engajamento',
        message: `Oi lindeza! 😍✨ 

Muito obrigado(a) pelo carinho! 💕

Se tiver interesse em fazer um ensaio, chama na DM que te passo todos os detalhes! 📸

#fotografia #ensaio #amor`,
        tags: ['comentário', 'engajamento', 'convite DM']
      },
      {
        id: 'insta2',
        title: 'Story de Agradecimento',
        category: 'agradecimento',
        message: `Gente!! 😭💕

Que casal mais lindo!! Obrigado pela confiança de sempre! 

Swipe para ver mais dessa sessão maravilhosa! ➡️

📸 Ensaios disponíveis
💌 Chama na DM

#fotografiadeamor #ensaio #casalfeliz #gratidao`,
        tags: ['story', 'agradecimento', 'divulgação']
      }
    ]
  };

  const categorias = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
    { id: 'email', name: 'E-mail', icon: Mail },
    { id: 'instagram', name: 'Instagram', icon: Camera }
  ];

  const categoriasTemplate = [
    { id: 'orcamento', name: 'Orçamentos', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 'agendamento', name: 'Agendamentos', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { id: 'entrega', name: 'Entrega', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 'duvidas', name: 'Dúvidas', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { id: 'agradecimento', name: 'Agradecimento', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    { id: 'reagendamento', name: 'Reagendamento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { id: 'engajamento', name: 'Engajamento', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  ];

  const getFilteredTemplates = () => {
    const categoryTemplates = templates[selectedCategory] || [];
    
    if (searchTerm) {
      return categoryTemplates.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return categoryTemplates;
  };

  const copyTemplate = (template) => {
    navigator.clipboard.writeText(template.message);
    toast({
      title: 'Template copiado!',
      description: 'O texto foi copiado para sua área de transferência.',
    });
  };

  const getCategoryColor = (category) => {
    const cat = categoriasTemplate.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleSaveTemplate = () => {
    // Aqui você integraria com o backend para salvar o template personalizado
    toast({
      title: 'Template salvo!',
      description: 'Seu template personalizado foi salvo com sucesso.',
    });
    setShowNewForm(false);
    setNewTemplate({ title: '', message: '', category: 'whatsapp' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8 text-green-600" />
            RESPOSTAS RÁPIDAS - Kit de Atendimento
          </h1>
          <p className="text-muted-foreground mt-2">
            Modelos prontos para WhatsApp, e-mail e redes sociais
          </p>
        </motion.div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categorias.map((categoria) => {
                const IconComponent = categoria.icon;
                return (
                  <Button
                    key={categoria.id}
                    variant={selectedCategory === categoria.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(categoria.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {categoria.name}
                  </Button>
                );
              })}
            </div>
            <Button onClick={() => setShowNewForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulário para Novo Template */}
      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Template</CardTitle>
              <CardDescription>
                Adicione um template personalizado à sua biblioteca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    placeholder="Ex: Resposta sobre preços"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-background"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                  placeholder="Digite sua mensagem template..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate}>Salvar Template</Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredTemplates().map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <Badge className={getCategoryColor(template.category)}>
                    {categoriasTemplate.find(c => c.id === template.category)?.name || template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-line">{template.message}</p>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyTemplate(template)}
                    className="flex-1"
                    size="sm"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copiar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nenhum template encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      {editingTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingTemplate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Editar Template</h2>
                <Button variant="ghost" onClick={() => setEditingTemplate(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input value={editingTemplate.title} readOnly />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea
                    value={editingTemplate.message}
                    rows={10}
                    readOnly
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => copyTemplate(editingTemplate)} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Template
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Dicas de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Dicas para Usar os Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">✏️ Personalização:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Substitua os campos entre [COLCHETES]</li>
                <li>• Adapte o tom para seu estilo</li>
                <li>• Adicione emojis se fizer sentido</li>
                <li>• Inclua informações específicas</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🚀 Boas Práticas:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Responda sempre no mesmo dia</li>
                <li>• Seja claro sobre valores e condições</li>
                <li>• Mantenha um tom profissional mas amigável</li>
                <li>• Acompanhe cada conversa até o fechamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default RespostasRapidasPage;