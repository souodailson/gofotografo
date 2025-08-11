import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, X, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from '@/contexts/DataContext';

const WorkflowFilters = ({ activeFilters, setActiveFilters, searchTerm, setSearchTerm }) => {
  const { servicePackagesData, workflowCards } = useData(); 

  const eventTypes = React.useMemo(() => {
    const niches = new Set();
    if (Array.isArray(servicePackagesData)) {
      servicePackagesData.forEach(pkg => {
        if (pkg.niche) niches.add(pkg.niche);
      });
    }
    return Array.from(niches);
  }, [servicePackagesData]);

  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    if (Array.isArray(workflowCards)) {
      workflowCards.forEach(card => {
        if (card.tags && Array.isArray(card.tags)) {
          card.tags.forEach(tag => tagsSet.add(tag));
        }
      });
    }
    return Array.from(tagsSet).sort();
  }, [workflowCards]);

  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({ ...prev, [filterName]: value === "all-items" ? "" : value }));
  };

  const clearFilters = () => {
    setActiveFilters({ eventType: '', period: '', packageId: '', financialStatus: '', tag: '' });
    setSearchTerm('');
  };
  
  const hasActiveFilters = Object.values(activeFilters).some(val => val !== '') || searchTerm !== '';

  return (
    <div className="p-4 bg-card rounded-xl shadow-lg border border-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div className="lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Busca Rápida</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Nome, data, pacote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Evento</label>
          <Select value={activeFilters.eventType || "all-items"} onValueChange={(value) => handleFilterChange('eventType', value)}>
            <SelectTrigger id="eventType" className="bg-background">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all-items">Todos</SelectItem>
              {eventTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="period" className="block text-sm font-medium text-muted-foreground mb-1">Período</label>
          <Select value={activeFilters.period || "all-items"} onValueChange={(value) => handleFilterChange('period', value)}>
            <SelectTrigger id="period" className="bg-background">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-items">Qualquer</SelectItem>
              <SelectItem value="next7days">Próximos 7 dias</SelectItem>
              <SelectItem value="next30days">Próximos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="packageId" className="block text-sm font-medium text-muted-foreground mb-1">Pacote</label>
          <Select value={activeFilters.packageId || "all-items"} onValueChange={(value) => handleFilterChange('packageId', value)}>
              <SelectTrigger id="packageId" className="min-w-[150px] bg-background">
                  <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                  <SelectItem value="all-items">Todos</SelectItem>
                  {Array.isArray(servicePackagesData) && servicePackagesData.map(pkg => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>)}
              </SelectContent>
          </Select>
        </div>

        <div>
            <label htmlFor="financialStatus" className="block text-sm font-medium text-muted-foreground mb-1">Status Financeiro</label>
            <Select value={activeFilters.financialStatus || "all-items"} onValueChange={(value) => handleFilterChange('financialStatus', value)}>
                <SelectTrigger id="financialStatus" className="bg-background">
                    <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-items">Todos</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <div>
          <label htmlFor="tagFilter" className="block text-sm font-medium text-muted-foreground mb-1 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1.5" />Tags
          </label>
          <Select value={activeFilters.tag || "all-items"} onValueChange={(value) => handleFilterChange('tag', value)}>
            <SelectTrigger id="tagFilter" className="bg-background">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all-items">Todas</SelectItem>
              {allTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

      </div>
      {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
              </Button>
          </div>
      )}
    </div>
  );
};

export default WorkflowFilters;