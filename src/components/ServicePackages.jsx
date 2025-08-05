import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Archive as ArchiveIcon, DollarSign, Edit, Trash2, MoreVertical, Info, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useModalState } from '@/contexts/ModalStateContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useCardHoverEffect from '@/hooks/useCardHoverEffect';

const PackageCard = ({ pkg, onEdit, onDelete, onViewDetails }) => {
  const cardRef = useCardHoverEffect();
  return (
    <motion.div
      ref={cardRef}
      key={pkg.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-lg border border-border flex flex-col card-hover-effect"
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(pkg)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(pkg.id)} className="text-red-600 dark:text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{pkg.description || "Sem descrição"}</p>
        
        {pkg.niche && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-customGreen/10 dark:text-customGreen">
              <TagIcon className="w-3 h-3 mr-1.5" />
              {pkg.niche}
            </span>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-customGreen" />
            <span>Preço (à vista/Pix): <span className="font-semibold">R$ {Number(pkg.price_cash_pix || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
          </div>
           {pkg.price_card && (
            <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                <span>Preço (Cartão): <span className="font-semibold">R$ {Number(pkg.price_card || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
            </div>
           )}
          {pkg.cost && (
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2 text-orange-500" />
              <span>Custo Estimado: <span className="font-semibold">R$ {Number(pkg.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-border bg-accent/30 dark:bg-accent/10 rounded-b-xl">
         <Button variant="link" className="text-customPurple dark:text-customGreen p-0 h-auto" onClick={() => onViewDetails(pkg)}>Ver Detalhes</Button>
      </div>
    </motion.div>
  );
};


const ServicePackages = () => {
  const { toast } = useToast();
  const { servicePackages, loading, deleteServicePackage, refreshData, user } = useData();
  const { openModal } = useModalState();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  const safeServicePackagesData = servicePackages || [];

  useEffect(() => {
    if (user && !safeServicePackagesData.length) {
      refreshData('service_packages');
    }
  }, [user, safeServicePackagesData.length, refreshData]);

  const handleSaveSuccess = () => {
    refreshData('service_packages');
  };

  const handleAddNew = () => {
    openModal('servicePackage', { servicePackage: null, onSaveSuccess: handleSaveSuccess });
  };

  const handleEdit = (pkg) => {
    openModal('servicePackage', { servicePackage: pkg, onSaveSuccess: handleSaveSuccess });
  };

  const handleViewDetails = (pkg) => {
    openModal('servicePackage', { servicePackage: pkg, onSaveSuccess: handleSaveSuccess });
  };

  const handleDeleteRequest = (packageId) => {
    setPackageToDelete(packageId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (packageToDelete) {
      try {
        await deleteServicePackage(packageToDelete);
        toast({ title: "Pacote Removido", description: "O pacote de serviço foi removido com sucesso." });
        refreshData('service_packages'); 
      } catch (error) {
        toast({ title: "Erro ao Remover", description: error.message, variant: "destructive" });
      }
      setShowDeleteConfirm(false);
      setPackageToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground titulo-gradiente">Pacotes de Serviços</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie seus pacotes e serviços fotográficos</p>
        </motion.div>
        <Button onClick={handleAddNew} className="btn-custom-gradient text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Novo Pacote
        </Button>
      </div>

      {loading && (!safeServicePackagesData || safeServicePackagesData.length === 0) ? (
         <div className="text-center py-10">
            <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto animate-bounce mb-4" />
            <p className="text-muted-foreground">Carregando pacotes...</p>
        </div>
      ) : !safeServicePackagesData || safeServicePackagesData.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-card rounded-xl p-6 shadow-lg border border-border">
          <ArchiveIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum pacote de serviço cadastrado</h3>
          <p className="text-muted-foreground mb-4">Comece adicionando seus pacotes para facilitar a criação de orçamentos e trabalhos.</p>
          <Button onClick={handleAddNew} className="btn-custom-gradient text-white">
            <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Pacote
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeServicePackagesData.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              pkg={pkg} 
              onEdit={handleEdit} 
              onDelete={handleDeleteRequest}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este pacote de serviço? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPackageToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicePackages;