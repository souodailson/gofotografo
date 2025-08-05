import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail, User as UserIcon, MessageSquare, Eye, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import useCardHoverEffect from '@/hooks/useCardHoverEffect';
import { useNavigate } from 'react-router-dom';
import { useModalState } from '@/contexts/ModalStateContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useMobileLayout from '@/hooks/useMobileLayout';

const ClientCard = ({ client, onViewDetails, onEdit, onDelete, onWhatsApp }) => {
  const cardRef = useCardHoverEffect();
  
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div
      ref={cardRef}
      key={client.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border card-hover-effect flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewDetails(client)}>
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
            <AvatarImage src={client.profile_photo_url} alt={client.name} />
            <AvatarFallback className="bg-muted-foreground/20 text-foreground font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground text-base sm:text-lg hover:text-primary transition-colors">
              {client.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="secondary">{client.client_type}</Badge>
              {client.tags?.map(tag => (
                <Badge key={tag} variant={tag === 'Novo' ? 'default' : 'outline'} className={tag === 'Novo' ? 'bg-primary text-primary-foreground' : ''}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(client)}
            className="w-8 h-8 text-muted-foreground hover:text-primary"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(client)}
            className="w-8 h-8 text-muted-foreground hover:text-primary"
            title="Edição Rápida"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(client.id)}
            className="w-8 h-8 text-destructive/70 hover:text-destructive"
            title="Excluir Cliente"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5 text-xs sm:text-sm mb-4 flex-grow cursor-pointer" onClick={() => onViewDetails(client)}>
        {client.email && (
          <div className="flex items-center text-muted-foreground">
            <Mail className="w-3.5 h-3.5 mr-2" />
            {client.email}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center text-muted-foreground">
            <Phone className="w-3.5 h-3.5 mr-2" />
            {client.phone}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            client.status === 'Ativo'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {client.status}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWhatsApp(client.phone)}
            className="text-green-600 border-green-600 hover:bg-green-50 dark:text-customGreen dark:border-customGreen dark:hover:bg-customGreen/10"
            title="Enviar WhatsApp"
            disabled={!client.phone}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const selectBaseClasses = "w-full md:w-auto px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-background text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary";

const Clients = () => {
  const { clients, deleteClient, isFeatureEnabled } = useData();
  const { toast } = useToast();
  const { openModal } = useModalState();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { isMobile } = useMobileLayout();

  const filteredClients = clients.filter(client => {
    const nameMatch = client.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const cpfMatch = client.cpf?.includes(searchTerm);
    const cnpjMatch = client.cnpj?.includes(searchTerm);
    const matchesSearch = nameMatch || emailMatch || cpfMatch || cnpjMatch;
    const matchesFilter = filterType === 'all' || client.client_type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


  const handleEdit = (client) => {
    openModal('client', { clientId: client.id });
  };

  const handleDelete = (clientId) => {
    deleteClient(clientId);
    toast({
      title: "Cliente removido",
      description: "Cliente foi removido com sucesso!"
    });
  };

  const handleAddNew = () => {
    openModal('client', {});
  };

  const handleWhatsApp = (phone) => {
    if (!phone) {
      toast({ title: "WhatsApp", description: "Número de telefone não disponível.", variant: "destructive" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}`, '_blank'); 
  };

  const handleViewDetails = (client) => {
    if (client && client.id) {
      navigate(`/clients/${client.id}`);
    } else {
      toast({ title: "Erro", description: "ID do cliente não encontrado.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={isMobile ? "hidden" : ""}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground titulo-gradiente">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie seus clientes e contatos
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isFeatureEnabled('formularios_captacao') && (
            <Button 
              onClick={() => navigate('/forms')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Formulário de Captação
            </Button>
          )}
          {isFeatureEnabled('contratos') && (
            <Button 
              onClick={() => navigate('/contracts')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Contratos
            </Button>
          )}
          <Button 
            onClick={handleAddNew}
            className="btn-custom-gradient text-white shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome, email, CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className={selectBaseClasses}
            >
              <option value="all">Todos os tipos</option>
              <option value="Pessoa Física">Pessoa Física</option>
              <option value="Pessoa Jurídica">Pessoa Jurídica</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredClients.map((client) => (
          <ClientCard 
            key={client.id} 
            client={client} 
            onViewDetails={handleViewDetails}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onWhatsApp={handleWhatsApp} 
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-card rounded-xl p-6 shadow-lg border border-border"
        >
          <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-md sm:text-lg font-medium text-foreground mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando seu primeiro cliente'}
          </p>
          <Button onClick={handleAddNew} className="btn-custom-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cliente
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Clients;