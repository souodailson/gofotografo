import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Lightbulb, 
  Search, 
  Heart, 
  Baby, 
  Users, 
  Camera, 
  Sparkles,
  CheckCircle,
  FileText,
  Download,
  Copy,
  Star,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const InspiraPage = () => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  // Banco de ideias pré-definidas
  const ideiasCatalogo = {
    casamento: [
      {
        id: 'cas001',
        title: 'First Look Romântico',
        description: 'Momento íntimo antes da cerimônia onde os noivos se veem pela primeira vez',
        difficulty: 'Fácil',
        duration: '30min',
        bestTime: 'Golden Hour',
        equipment: ['Lente 85mm', 'Refletor'],
        location: 'Ambiente íntimo ou jardim',
        poses: [
          'Noivo de costas, noiva se aproximando',
          'Primeiro olhar - expressão genuína',
          'Abraço emocionado',
          'Mãos entrelaçadas sem mostrar rostos'
        ],
        checklist: [
          'Coordenar com cerimonialista',
          'Testar iluminação do local',
          'Preparar posições discretas',
          'Avisar fotógrafo auxiliar para detalhes'
        ],
        briefing: 'Momento especial e privado entre os noivos antes da cerimônia oficial. Foco na emoção e espontaneidade.',
        tags: ['romântico', 'intimista', 'emocional']
      },
      {
        id: 'cas002',
        title: 'Cerimônia ao Ar Livre',
        description: 'Casamento em ambiente natural com luz dourada',
        difficulty: 'Médio',
        duration: '2h',
        bestTime: 'Final da tarde',
        equipment: ['Teleobjetiva', 'Flash externo', 'Tripé'],
        location: 'Jardim, praia ou campo',
        poses: [
          'Entrada da noiva com luz de fundo',
          'Troca de votos em close',
          'Beijo do altar com convidados ao fundo',
          'Saída celebrando'
        ],
        checklist: [
          'Verificar direção do sol',
          'Plano B para chuva',
          'Posições estratégicas na cerimônia',
          'Backup de bateria extra'
        ],
        briefing: 'Casamento ao ar livre aproveitando a beleza natural. Atenção especial à luz e enquadramentos.',
        tags: ['ar livre', 'natural', 'dourado']
      }
    ],
    familia: [
      {
        id: 'fam001',
        title: 'Família no Parque',
        description: 'Ensaio casual e divertido em ambiente aberto',
        difficulty: 'Fácil',
        duration: '1h',
        bestTime: 'Manhã ou final da tarde',
        equipment: ['Lente 50mm', 'Refletor portátil'],
        location: 'Parque ou praça arborizada',
        poses: [
          'Caminhada natural em família',
          'Piquenique no gramado',
          'Brincadeiras com as crianças',
          'Abraço coletivo'
        ],
        checklist: [
          'Roupas coordenadas mas não iguais',
          'Brinquedos para entreter crianças',
          'Verificar horário de movimento no local',
          'Lenços ou toalha para sentar'
        ],
        briefing: 'Ensaio descontraído focando na conexão familiar. Priorizar momentos espontâneos.',
        tags: ['casual', 'infantil', 'descontraído']
      },
      {
        id: 'fam002',
        title: 'Gerações Reunidas',
        description: 'Retrato de múltiplas gerações da família',
        difficulty: 'Médio',
        duration: '1h30',
        bestTime: 'Tarde',
        equipment: ['Lente grande angular', 'Tripé', 'Timer'],
        location: 'Casa da família ou estúdio',
        poses: [
          'Foto formal de todas as gerações',
          'Avós com netos',
          'Casais por geração',
          'Momentos de interação natural'
        ],
        checklist: [
          'Coordenar agenda de todos',
          'Cadeiras para idosos',
          'Iluminação adequada para retratos',
          'Lista de combinações desejadas'
        ],
        briefing: 'Ensaio especial celebrando a união familiar entre gerações. Foco na harmonia e respeito.',
        tags: ['gerações', 'formal', 'herança']
      }
    ],
    newborn: [
      {
        id: 'new001',
        title: 'Newborn Minimalista',
        description: 'Ensaio clean focado no bebê e detalhes',
        difficulty: 'Difícil',
        duration: '3h',
        bestTime: 'Manhã (bebê mais calmo)',
        equipment: ['Macro 100mm', 'Aquecedor', 'Props neutros'],
        location: 'Estúdio ou quarto bem iluminado',
        poses: [
          'Bebê dormindo em wrap',
          'Detalhes: mãos, pés, perfil',
          'Com os pais de forma sutil',
          'Props temáticos suaves'
        ],
        checklist: [
          'Ambiente aquecido (26-28°C)',
          'Ruído branco para acalmar',
          'Paciência para o tempo do bebê',
          'Higienização de props'
        ],
        briefing: 'Ensaio delicado focando na pureza e delicadeza do recém-nascido. Segurança em primeiro lugar.',
        tags: ['delicado', 'minimalista', 'detalhes']
      }
    ],
    corporativo: [
      {
        id: 'corp001',
        title: 'Headshots Profissionais',
        description: 'Retratos corporativos elegantes e confiáveis',
        difficulty: 'Médio',
        duration: '30min por pessoa',
        bestTime: 'Qualquer horário',
        equipment: ['Lente 85mm', 'Softbox', 'Fundo neutro'],
        location: 'Estúdio ou escritório',
        poses: [
          'Retrato formal sorrindo',
          'Pose séria e confiante',
          'Meio corpo com braços cruzados',
          'Variação casual se apropriado'
        ],
        checklist: [
          'Orientar sobre vestimenta',
          'Iluminação uniforme e profissional',
          'Fundo limpo e consistente',
          'Entrega rápida para uso comercial'
        ],
        briefing: 'Retratos profissionais que transmitam competência e confiabilidade para uso corporativo.',
        tags: ['profissional', 'confiante', 'corporativo']
      }
    ],
    editorial: [
      {
        id: 'edit001',
        title: 'Moda Urbana',
        description: 'Ensaio de moda em cenário urbano contemporâneo',
        difficulty: 'Difícil',
        duration: '4h',
        bestTime: 'Golden hour e blue hour',
        equipment: ['Várias lentes', 'Flash externo', 'Refletores'],
        location: 'Centro urbano, grafites, arquitetura',
        poses: [
          'Poses dinâmicas em movimento',
          'Interação com ambiente urbano',
          'Looks contemplando a arquitetura',
          'Detalhes da roupa e acessórios'
        ],
        checklist: [
          'Autorização para locações',
          'Múltiplas mudanças de roupa',
          'Maquiadora/stylist no set',
          'Plano de locações sequencial'
        ],
        briefing: 'Ensaio editorial moderno contrastando moda e urbanidade. Foco na criatividade e impacto visual.',
        tags: ['urbano', 'criativo', 'fashion']
      }
    ]
  };

  const categorias = [
    { id: 'all', name: 'Todas', icon: Sparkles },
    { id: 'casamento', name: 'Casamento', icon: Heart },
    { id: 'familia', name: 'Família', icon: Users },
    { id: 'newborn', name: 'Newborn', icon: Baby },
    { id: 'corporativo', name: 'Corporativo', icon: Camera },
    { id: 'editorial', name: 'Editorial', icon: Star }
  ];

  // Filtrar ideias baseado na categoria e busca
  const getFilteredIdeas = () => {
    let allIdeas = [];
    
    if (selectedCategory === 'all') {
      Object.values(ideiasCatalogo).forEach(categoryIdeas => {
        allIdeas = [...allIdeas, ...categoryIdeas];
      });
    } else {
      allIdeas = ideiasCatalogo[selectedCategory] || [];
    }

    if (searchTerm) {
      allIdeas = allIdeas.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return allIdeas;
  };

  const handleGenerateBriefing = (idea) => {
    const briefing = `
📸 BRIEFING - ${idea.title}

📋 RESUMO:
${idea.description}

⏱️ DURAÇÃO: ${idea.duration}
🌅 MELHOR HORÁRIO: ${idea.bestTime}
📍 LOCAL: ${idea.location}
⭐ DIFICULDADE: ${idea.difficulty}

🎯 EQUIPAMENTOS NECESSÁRIOS:
${idea.equipment.map(item => `• ${item}`).join('\n')}

📝 POSES SUGERIDAS:
${idea.poses.map((pose, index) => `${index + 1}. ${pose}`).join('\n')}

✅ CHECKLIST DE PRODUÇÃO:
${idea.checklist.map(item => `□ ${item}`).join('\n')}

💬 BRIEFING PARA O CLIENTE:
${idea.briefing}

🏷️ TAGS: ${idea.tags.join(', ')}

${customNotes ? `\n📝 OBSERVAÇÕES PERSONALIZADAS:\n${customNotes}` : ''}

---
Gerado pelo INSPIRA - Central de Ideias GoFotógrafo
    `;
    
    // Copiar para clipboard
    navigator.clipboard.writeText(briefing);
    toast({
      title: 'Briefing copiado!',
      description: 'O briefing foi copiado para sua área de transferência.',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            INSPIRA - Central de Ideias de Ensaio
          </h1>
          <p className="text-muted-foreground mt-2">
            Catálogo interativo de conceitos criativos para suas sessões fotográficas
          </p>
        </motion.div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por conceito, estilo ou tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Grid de Ideias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredIdeas().map((idea) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <Badge className={getDifficultyColor(idea.difficulty)}>
                    {idea.difficulty}
                  </Badge>
                </div>
                <CardDescription>{idea.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">⏱️ Duração:</span>
                    <span>{idea.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">🌅 Melhor horário:</span>
                    <span>{idea.bestTime}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedIdea(idea)}
                  className="w-full"
                  variant="outline"
                >
                  Ver Detalhes e Gerar Briefing
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedIdea && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIdea(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedIdea.title}</h2>
                  <p className="text-muted-foreground mt-1">{selectedIdea.description}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedIdea(null)}>
                  ✕
                </Button>
              </div>

              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="producao">Produção</TabsTrigger>
                  <TabsTrigger value="briefing">Briefing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="detalhes" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Informações Técnicas
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Duração:</strong> {selectedIdea.duration}</div>
                        <div><strong>Dificuldade:</strong> {selectedIdea.difficulty}</div>
                        <div><strong>Melhor horário:</strong> {selectedIdea.bestTime}</div>
                        <div><strong>Local:</strong> {selectedIdea.location}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Equipamentos</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedIdea.equipment.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Poses Sugeridas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedIdea.poses.map((pose, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm p-2 bg-accent rounded">
                          <span className="font-medium text-primary">{index + 1}.</span>
                          <span>{pose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="producao" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Checklist de Produção
                    </h4>
                    <div className="space-y-2">
                      {selectedIdea.checklist.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Observações Personalizadas</h4>
                    <Textarea
                      placeholder="Adicione suas próprias observações e adaptações para este ensaio..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="briefing" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Briefing para o Cliente
                    </h4>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-sm">{selectedIdea.briefing}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateBriefing(selectedIdea)} className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Briefing Completo
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateBriefing(selectedIdea)}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar PDF
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}

      {getFilteredIdeas().length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma ideia encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default InspiraPage;