import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/authContext';
import { 
  getAllSpots, 
  searchSpots, 
  createSpot, 
  addRating, 
  toggleRatingLike, 
  replyToRating,
  SPOT_CATEGORIES,
  SPOT_REGIONS
} from '@/lib/spotApi';
import { 
  MapPin, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  Star,
  Camera,
  Palette,
  Video,
  Music,
  Flower,
  Car,
  Home,
  Coffee,
  TreePine,
  Building,
  Heart,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SpotPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedRegion, setSelectedRegion] = useState('todas');
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingData, setRatingData] = useState({
    rating: 5,
    comment: ''
  });
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'locais',
    category: 'parque',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    price: '',
    rating: 5,
    notes: '',
    tags: []
  });

  // Base de dados de locais e fornecedores
  const spotDatabase = {
    locais: [
      {
        id: 'loc1',
        name: 'Parque Ibirapuera',
        category: 'parque',
        description: 'Amplo parque urbano com áreas verdes, lagos e arquitetura moderna',
        address: 'Av. Paulista, São Paulo - SP',
        phone: '(11) 5574-5045',
        email: '',
        website: 'www.parqueibirapuera.org',
        price: 'Gratuito',
        rating: 5,
        notes: 'Melhor horário: manhã ou final da tarde. Evitar fins de semana.',
        tags: ['verde', 'urbano', 'família', 'casamento'],
        tipo: 'Parque'
      },
      {
        id: 'loc2',
        name: 'Centro Histórico',
        category: 'urbano',
        description: 'Arquitetura colonial e republicana, ruas de paralelepípedo',
        address: 'Centro, São Paulo - SP',
        phone: '',
        email: '',
        website: '',
        price: 'Gratuito',
        rating: 4,
        notes: 'Cuidado com segurança. Melhor em horário comercial.',
        tags: ['histórico', 'arquitetura', 'urbano', 'editorial'],
        tipo: 'Centro Urbano'
      },
      {
        id: 'loc3',
        name: 'Praia de Copacabana',
        category: 'praia',
        description: 'Praia icônica com calçadão famoso e vista do Pão de Açúcar',
        address: 'Copacabana, Rio de Janeiro - RJ',
        phone: '',
        email: '',
        website: '',
        price: 'Gratuito',
        rating: 5,
        notes: 'Golden hour incrível. Evitar meio-dia pelo sol forte.',
        tags: ['praia', 'pôr do sol', 'romântico', 'verão'],
        tipo: 'Praia'
      },
      {
        id: 'loc4',
        name: 'Estúdio Fotográfico Pro',
        category: 'estudio',
        description: 'Estúdio completo com fundos, iluminação profissional e props',
        address: 'Rua Augusta, 1234 - São Paulo - SP',
        phone: '(11) 99999-9999',
        email: 'contato@estudiopro.com',
        website: 'www.estudiopro.com',
        price: 'R$ 200/hora',
        rating: 5,
        notes: 'Agendamento com 48h de antecedência. Inclui assistente.',
        tags: ['profissional', 'controlado', 'newborn', 'corporativo'],
        tipo: 'Estúdio'
      }
    ],
    fornecedores: [
      {
        id: 'forn1',
        name: 'Makeup by Ana',
        category: 'makeup',
        description: 'Maquiadora especializada em noivas e ensaios fotográficos',
        address: 'Vila Madalena, São Paulo - SP',
        phone: '(11) 98888-8888',
        email: 'ana@makeup.com',
        website: '@makeupbyana',
        price: 'A partir de R$ 150',
        rating: 5,
        notes: 'Muito pontual. Leva kit completo. Especialista em pele madura.',
        tags: ['noiva', 'ensaio', 'profissional', 'confiável'],
        tipo: 'Maquiadora'
      },
      {
        id: 'forn2',
        name: 'Floricultura Jardim',
        category: 'decoracao',
        description: 'Arranjos florais e decoração para eventos e ensaios',
        address: 'Jardins, São Paulo - SP',
        phone: '(11) 97777-7777',
        email: 'vendas@jardim.com',
        website: 'www.floriculturajardim.com',
        price: 'A partir de R$ 80',
        rating: 4,
        notes: 'Entrega no local. Variedade de flores sazonais.',
        tags: ['flores', 'decoração', 'casamento', 'romântico'],
        tipo: 'Floricultura'
      },
      {
        id: 'forn3',
        name: 'VideoMaker João',
        category: 'videomaker',
        description: 'Videomaker especializado em casamentos e ensaios',
        address: 'Mooca, São Paulo - SP',
        phone: '(11) 96666-6666',
        email: 'joao@videomaker.com',
        website: '@videomakerjao',
        price: 'R$ 800/evento',
        rating: 5,
        notes: 'Trabalha bem em equipe. Equipment próprio completo.',
        tags: ['vídeo', 'casamento', 'profissional', 'criativo'],
        tipo: 'Videomaker'
      },
      {
        id: 'forn4',
        name: 'DJ Marcus Beats',
        category: 'musica',
        description: 'DJ para eventos e trilha sonora durante ensaios',
        address: 'Brooklin, São Paulo - SP',
        phone: '(11) 95555-5555',
        email: 'marcus@beats.com',
        website: '@djmarcusbeats',
        price: 'R$ 400/evento',
        rating: 4,
        notes: 'Boa seleção musical. Equipamento próprio. Pontual.',
        tags: ['música', 'festa', 'animação', 'profissional'],
        tipo: 'DJ/Música'
      }
    ]
  };

  const categorias = {
    locais: [
      { id: 'todos', name: 'Todos', icon: MapPin },
      { id: 'parque', name: 'Parques', icon: TreePine },
      { id: 'praia', name: 'Praias', icon: Coffee },
      { id: 'urbano', name: 'Urbano', icon: Building },
      { id: 'estudio', name: 'Estúdios', icon: Camera },
      { id: 'igreja', name: 'Igrejas', icon: Heart },
      { id: 'hotel', name: 'Hotéis', icon: Home }
    ],
    fornecedores: [
      { id: 'todos', name: 'Todos', icon: Star },
      { id: 'makeup', name: 'Maquiagem', icon: Palette },
      { id: 'videomaker', name: 'Videomaker', icon: Video },
      { id: 'musica', name: 'Música/DJ', icon: Music },
      { id: 'decoracao', name: 'Decoração', icon: Flower },
      { id: 'transporte', name: 'Transporte', icon: Car }
    ]
  };

  const getFilteredItems = () => {
    const items = spotDatabase[selectedType] || [];
    
    let filtered = items;
    
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleSaveItem = () => {
    toast({
      title: editingItem ? 'Item atualizado!' : 'Item adicionado!',
      description: `${newItem.name} foi ${editingItem ? 'atualizado' : 'adicionado'} à sua lista.`,
    });
    
    setShowAddForm(false);
    setEditingItem(null);
    setNewItem({
      name: '',
      type: 'locais',
      category: 'parque',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      price: '',
      rating: 5,
      notes: '',
      tags: []
    });
  };

  const handleEditItem = (item) => {
    setNewItem(item);
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDeleteItem = (id) => {
    toast({
      title: 'Item removido!',
      description: 'O item foi removido da sua lista.',
    });
  };

  const handleShareItem = (item) => {
    const shareText = `📍 ${item.name}\n\n${item.description}\n\n📧 ${item.email}\n📞 ${item.phone}\n🌐 ${item.website}\n💰 ${item.price}\n\nCompartilhado via GoFotógrafo SPOT`;
    
    navigator.clipboard.writeText(shareText);
    toast({
      title: 'Informações copiadas!',
      description: 'As informações foram copiadas para compartilhar.',
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <MapPin className="w-8 h-8 text-red-600" />
            SPOT - Mapa de Fornecedores e Locais
          </h1>
          <p className="text-muted-foreground mt-2">
            Sua base de locais fotogênicos e fornecedores confiáveis
          </p>
        </motion.div>

      {/* Navegação Principal */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="locais">Locais Fotogênicos</TabsTrigger>
              <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={`Buscar ${selectedType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias[selectedType]?.map((categoria) => {
                const IconComponent = categoria.icon;
                return (
                  <Button
                    key={categoria.id}
                    variant={selectedCategory === categoria.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(categoria.id)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <IconComponent className="w-4 h-4" />
                    {categoria.name}
                  </Button>
                );
              })}
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulário para Adicionar/Editar */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{editingItem ? 'Editar' : 'Adicionar'} {selectedType === 'locais' ? 'Local' : 'Fornecedor'}</CardTitle>
              <CardDescription>
                {editingItem ? 'Atualize' : 'Adicione'} as informações do {selectedType === 'locais' ? 'local' : 'fornecedor'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Ex: Parque da Cidade"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-background"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  >
                    {categorias[selectedType]?.filter(cat => cat.id !== 'todos').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Descreva o local ou serviço..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Endereço</Label>
                  <Input
                    value={newItem.address}
                    onChange={(e) => setNewItem({...newItem, address: e.target.value})}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={newItem.phone}
                    onChange={(e) => setNewItem({...newItem, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>E-mail</Label>
                  <Input
                    value={newItem.email}
                    onChange={(e) => setNewItem({...newItem, email: e.target.value})}
                    placeholder="contato@exemplo.com"
                  />
                </div>
                <div>
                  <Label>Website/Instagram</Label>
                  <Input
                    value={newItem.website}
                    onChange={(e) => setNewItem({...newItem, website: e.target.value})}
                    placeholder="@instagram ou www.site.com"
                  />
                </div>
                <div>
                  <Label>Preço</Label>
                  <Input
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    placeholder="R$ 100 ou Gratuito"
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  placeholder="Dicas importantes, horários recomendados, etc..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveItem}>
                  {editingItem ? 'Atualizar' : 'Adicionar'}
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
        </motion.div>
      )}

      {/* Lista de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredItems().map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="mt-1">{item.tipo}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {getRatingStars(item.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                
                <div className="space-y-2 text-sm">
                  {item.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{item.address}</span>
                    </div>
                  )}
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>{item.email}</span>
                    </div>
                  )}
                  {item.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      <span>{item.website}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {item.price}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {item.notes && (
                  <div className="p-2 bg-accent rounded text-xs">
                    <p className="text-muted-foreground">{item.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareItem(item)}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {getFilteredItems().length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Nenhum {selectedType === 'locais' ? 'local' : 'fornecedor'} encontrado
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou adicione novos itens
          </p>
        </div>
      )}

      {/* Dicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Dicas para Usar o SPOT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">📍 Locais:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Visite antes do ensaio para conhecer a luz</li>
                <li>• Verifique autorizações necessárias</li>
                <li>• Anote horários de funcionamento</li>
                <li>• Tenha sempre um plano B</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🤝 Fornecedores:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mantenha relacionamento próximo</li>
                <li>• Negocie parcerias de longo prazo</li>
                <li>• Peça referências de outros clientes</li>
                <li>• Compartilhe indicações de qualidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default SpotPage;