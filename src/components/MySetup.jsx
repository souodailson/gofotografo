import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, DollarSign, TrendingDown, Edit, Trash2, PackageSearch, Wrench, ShieldCheck, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import EquipmentModal from '@/components/modals/EquipmentModal';
import MaintenanceModal from '@/components/modals/MaintenanceModal'; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import useMobileLayout from '@/hooks/useMobileLayout';

const StatCard = ({ title, value, icon: Icon, description, colorClass = "text-customPurple" }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-customPurple dark:border-customGreen">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
    </CardContent>
  </Card>
);

const EquipmentCard = ({ equipment, onEdit, onDelete, onAddMaintenanceClick }) => {
  const { getEquipmentMaintenances, loading: dataLoading } = useData();
  const [maintenances, setMaintenances] = useState([]);
  const [isLoadingMaintenances, setIsLoadingMaintenances] = useState(true);

  useEffect(() => {
    setIsLoadingMaintenances(true);
    const fetchedMaintenances = getEquipmentMaintenances(equipment.id);
    setMaintenances(fetchedMaintenances);
    setIsLoadingMaintenances(false);
  }, [equipment.id, getEquipmentMaintenances, dataLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return 'Data inválida';
      }
      return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="gradient-border-card shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
    >
      <div className="card-content-inner rounded-lg overflow-hidden">
        <div className="p-5 bg-gradient-to-br from-card to-muted/30">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-foreground">{equipment.nome_equipamento}</h3>
              <p className="text-sm text-muted-foreground">{equipment.marca} - {equipment.modelo}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(equipment)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full">
                <Edit className="h-5 w-5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o equipamento "{equipment.nome_equipamento}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(equipment.id)} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div >

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-none">
            <TabsTrigger value="details" className="data-[state=active]:bg-customPurple/10 data-[state=active]:text-customPurple data-[state=active]:shadow-inner">
              <Info className="w-4 h-4 mr-2" /> Detalhes
            </TabsTrigger>
            <TabsTrigger value="maintenances" className="data-[state=active]:bg-customGreen/10 data-[state=active]:text-customGreen data-[state=active]:shadow-inner">
              <Wrench className="w-4 h-4 mr-2" /> Manutenções
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-5 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><strong>Valor Compra:</strong> {formatCurrency(equipment.valor_compra)}</div>
              <div><strong>Data Compra:</strong> {formatDate(equipment.data_compra)}</div>
              <div><strong>Depreciação Mensal:</strong> {formatCurrency(equipment.depreciacao_mensal)}</div>
              <div><strong>Vida Útil:</strong> {equipment.vida_util_anos || 'N/A'} anos</div>
            </div>
            { (equipment.seguradora || equipment.numero_apolice) && (
              <div className="pt-3 mt-3 border-t border-border">
                <h4 className="font-semibold text-foreground mb-1.5 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-customGreen" /> Seguro</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div><strong>Seguradora:</strong> {equipment.seguradora || 'N/A'}</div>
                  <div><strong>Apólice:</strong> {equipment.numero_apolice || 'N/A'}</div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="maintenances" className="p-5">
            <Button onClick={() => onAddMaintenanceClick(equipment.id)} size="sm" className="mb-4 w-full btn-custom-secondary">
              <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Manutenção
            </Button>
            {isLoadingMaintenances ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando manutenções...</p>
            ) : maintenances.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                {maintenances.map(m => (
                  <li key={m.id} className="p-3 bg-muted/50 rounded-md shadow-sm">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-foreground flex items-center"><CalendarDays className="w-3 h-3 mr-1.5 text-customPurple"/> {formatDate(m.data_manutencao)}</span>
                      <span className="font-bold text-red-500">{formatCurrency(m.custo)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.descricao_servico}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma manutenção registrada.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};


const MySetup = () => {
  const { toast } = useToast();
  const { 
    equipments, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment: deleteEquipmentContext, 
    addMaintenance: addMaintenanceContext,
    addTransaction,
    refreshData, 
    loading: dataLoading,
    user 
  } = useData();
  
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [currentEquipmentIdForMaintenance, setCurrentEquipmentIdForMaintenance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useMobileLayout();

  const totalInvestment = useMemo(() => 
    equipments.reduce((sum, eq) => sum + (Number(eq.valor_compra) || 0), 0),
  [equipments]);

  const totalMonthlyDepreciation = useMemo(() =>
    equipments.reduce((sum, eq) => sum + (Number(eq.depreciacao_mensal) || 0), 0),
  [equipments]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAddNewEquipment = () => {
    setEditingEquipment(null);
    setIsEquipmentModalOpen(true);
  };

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setIsEquipmentModalOpen(true);
  };

  const handleDeleteEquipment = async (id) => {
    setIsLoading(true);
    try {
      await deleteEquipmentContext(id);
      toast({ title: "Sucesso!", description: "Equipamento excluído." });
      await refreshData(); 
    } catch (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveEquipment = async (formData) => {
    setIsLoading(true);
    const { vida_util_anos, valor_compra, ...restData } = formData;
    const valorCompraNum = parseFloat(valor_compra) || 0;
    const vidaUtilNum = parseInt(vida_util_anos, 10) || 0;
    
    let depreciacaoMensal = 0;
    if (vidaUtilNum > 0 && valorCompraNum > 0) {
      depreciacaoMensal = valorCompraNum / (vidaUtilNum * 12);
    }

    const dataToSave = {
      ...restData,
      valor_compra: valorCompraNum,
      vida_util_anos: vidaUtilNum,
      depreciacao_mensal: depreciacaoMensal,
    };
    
    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, dataToSave);
        toast({ title: "Sucesso!", description: "Equipamento atualizado." });
      } else {
        await addEquipment(dataToSave);
        toast({ title: "Sucesso!", description: "Equipamento adicionado." });
      }
      setIsEquipmentModalOpen(false);
      setEditingEquipment(null);
      await refreshData(); 
    } catch (error) {
      toast({ title: "Erro ao salvar equipamento", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaintenanceClick = (equipmentId) => {
    setCurrentEquipmentIdForMaintenance(equipmentId);
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenance = async (maintenanceData, launchAsExpense) => {
    if (!currentEquipmentIdForMaintenance || !user) {
      toast({ title: "Erro", description: "ID do equipamento ou usuário não encontrado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const savedMaintenance = await addMaintenanceContext({ 
        ...maintenanceData, 
        equipamento_id: currentEquipmentIdForMaintenance,
        user_id: user.id 
      });
      
      if (savedMaintenance && launchAsExpense && maintenanceData.custo && parseFloat(maintenanceData.custo) > 0) {
        const equipmentName = equipments.find(eq => eq.id === currentEquipmentIdForMaintenance)?.nome_equipamento || 'Equipamento';
        await addTransaction({
          tipo: 'SAIDA',
          valor: parseFloat(maintenanceData.custo),
          descricao: `Manutenção: ${maintenanceData.descricao_servico} (${equipmentName})`,
          data: maintenanceData.data_manutencao,
          status: 'PAGO',
          category: 'Manutenção de Equipamentos',
          user_id: user.id,
        });
        toast({ title: "Sucesso!", description: "Manutenção adicionada e despesa lançada." });
      } else {
        toast({ title: "Sucesso!", description: "Manutenção adicionada." });
      }

      setIsMaintenanceModalOpen(false);
      setCurrentEquipmentIdForMaintenance(null);
      await refreshData(); 
    } catch (error) {
      toast({ title: "Erro ao salvar manutenção", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  if (dataLoading && equipments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <div className="flex flex-col items-center">
          <PackageSearch className="w-16 h-16 text-customPurple animate-bounce mb-4" />
          <p className="text-xl text-muted-foreground">Carregando seus equipamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-0">
          <span className="bg-gradient-to-r from-customPurple to-customGreen bg-clip-text text-transparent">
            Meu Setup
          </span>
        </h1>
        <Button onClick={handleAddNewEquipment} className="btn-custom-gradient shadow-lg hover:opacity-90 transition-opacity">
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          title="Investimento Total" 
          value={formatCurrency(totalInvestment)} 
          icon={DollarSign}
          description="Soma do valor de compra de todos os equipamentos."
          colorClass="text-customGreen"
        />
        <StatCard 
          title="Depreciação Mensal Total" 
          value={formatCurrency(totalMonthlyDepreciation)} 
          icon={TrendingDown}
          description="Soma da depreciação mensal de todos os equipamentos."
          colorClass="text-red-500"
        />
      </div>
      
      <AnimatePresence>
        {equipments.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {equipments.map(equipment => (
              <EquipmentCard 
                key={equipment.id} 
                equipment={equipment} 
                onEdit={handleEditEquipment}
                onDelete={handleDeleteEquipment}
                onAddMaintenanceClick={handleAddMaintenanceClick}
              />
            ))}
          </motion.div>
        ) : (
          !dataLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-card border border-dashed border-border rounded-xl shadow-sm"
            >
              <PackageSearch className="mx-auto mb-6 h-16 w-16 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold text-foreground mb-3">Nenhum Equipamento Cadastrado</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Comece adicionando seus equipamentos para controlar valor, depreciação, seguro e manutenções.
              </p>
              <Button onClick={handleAddNewEquipment} className="btn-custom-gradient shadow-lg hover:opacity-90 transition-opacity">
                <PlusCircle className="w-5 h-5 mr-2" />
                Adicionar Primeiro Equipamento
              </Button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => { setIsEquipmentModalOpen(false); setEditingEquipment(null); }}
        onSave={handleSaveEquipment}
        equipmentData={editingEquipment}
        isLoading={isLoading}
      />
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => { setIsMaintenanceModalOpen(false); setCurrentEquipmentIdForMaintenance(null); }}
        onSave={handleSaveMaintenance}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MySetup;