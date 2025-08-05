import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DollarSign, PlusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';

import FixedCostsSection from '@/components/precifique/FixedCostsSection';
import ServiceDescriptionSection from '@/components/precifique/ServiceDescriptionSection';
import TimeCostSection from '@/components/precifique/TimeCostSection';
import VariableCostsSection from '@/components/precifique/VariableCostsSection';
import EquipmentSelectionSection from '@/components/precifique/EquipmentSelectionSection';
import BaseServiceCostCard from '@/components/precifique/BaseServiceCostCard';
import PricingStrategySection from '@/components/precifique/PricingStrategySection';
import FixedCostModal from '@/components/modals/FixedCostModal';
import { parsePercentage } from '@/lib/precifiqueUtils';

const Precifique = () => {
  const { toast } = useToast();
  const { 
    fixedCosts, 
    addFixedCost, 
    updateFixedCost, 
    deleteFixedCost,
    equipments,
    addPricedService,
    addServicePackage, 
    loading: dataLoading,
  } = useData();
  
  const [isFixedCostModalOpen, setIsFixedCostModalOpen] = useState(false);
  const [editingFixedCost, setEditingFixedCost] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [hours, setHours] = useState({ meeting: '', travel: '', event: '', editing: ''});
  const [variableCosts, setVariableCosts] = useState([{ id: uuidv4(), description: '', value: '' }]);
  const [selectedEquipments, setSelectedEquipments] = useState({});

  const [financialReservePercentage, setFinancialReservePercentage] = useState('');
  const [profitMarginPercentage, setProfitMarginPercentage] = useState('');

  const totalMonthlyFixedCost = useMemo(() => 
    fixedCosts.reduce((sum, cost) => sum + (Number(cost.valor_mensal) || 0), 0),
  [fixedCosts]);

  const costPerHour = useMemo(() => {
    if (totalMonthlyFixedCost > 0) {
      return totalMonthlyFixedCost / 160; 
    }
    return 0;
  }, [totalMonthlyFixedCost]);
  
  const handleAddNewFixedCost = () => {
    setEditingFixedCost(null);
    setIsFixedCostModalOpen(true);
  };

  const handleEditFixedCost = (cost) => {
    setEditingFixedCost(cost);
    setIsFixedCostModalOpen(true);
  };

  const handleDeleteFixedCost = async (id) => {
    setIsLoadingModal(true);
    try {
      await deleteFixedCost(id);
      toast({ title: "Sucesso!", description: "Custo fixo excluído." });
    } catch (error) {
      toast({ title: "Erro ao excluir", description: error.message || "Não foi possível excluir o custo.", variant: "destructive" });
    } finally {
      setIsLoadingModal(false);
    }
  };
  
  const handleSaveFixedCost = async (formData) => {
    setIsLoadingModal(true);
    const dataToSave = {
      ...formData,
      valor_mensal: parseFloat(formData.valor_mensal) || 0,
    };
    
    try {
      if (editingFixedCost) {
        await updateFixedCost(editingFixedCost.id, dataToSave);
        toast({ title: "Sucesso!", description: "Custo fixo atualizado." });
      } else {
        await addFixedCost(dataToSave);
        toast({ title: "Sucesso!", description: "Custo fixo adicionado." });
      }
      setIsFixedCostModalOpen(false);
      setEditingFixedCost(null);
    } catch (error) {
      toast({ title: "Erro ao salvar custo", description: error.message || "Não foi possível salvar o custo.", variant: "destructive" });
    } finally {
      setIsLoadingModal(false);
    }
  };

  const totalDedicatedHours = useMemo(() => {
    return (parseFloat(hours.meeting) || 0) + 
           (parseFloat(hours.travel) || 0) + 
           (parseFloat(hours.event) || 0) + 
           (parseFloat(hours.editing) || 0);
  }, [hours]);

  const handleAddVariableCost = () => {
    setVariableCosts([...variableCosts, { id: uuidv4(), description: '', value: '' }]);
  };

  const handleVariableCostChange = (id, field, value) => {
    setVariableCosts(variableCosts.map(cost => 
      cost.id === id ? { ...cost, [field]: value } : cost
    ));
  };

  const handleRemoveVariableCost = (id) => {
    setVariableCosts(variableCosts.filter(cost => cost.id !== id));
  };

  const totalVariableCosts = useMemo(() => {
    return variableCosts.reduce((sum, cost) => sum + (parseFloat(cost.value) || 0), 0);
  }, [variableCosts]);

  const handleEquipmentSelection = (equipmentId) => {
    setSelectedEquipments(prev => ({
      ...prev,
      [equipmentId]: !prev[equipmentId]
    }));
  };

  const totalSelectedEquipmentsDepreciation = useMemo(() => {
    return equipments.reduce((sum, eq) => {
      if (selectedEquipments[eq.id]) {
        return sum + (parseFloat(eq.depreciacao_mensal) || 0);
      }
      return sum;
    }, 0);
  }, [equipments, selectedEquipments]);

  const baseServiceCost = useMemo(() => {
    const timeCost = costPerHour * totalDedicatedHours;
    return timeCost + totalVariableCosts + totalSelectedEquipmentsDepreciation;
  }, [costPerHour, totalDedicatedHours, totalVariableCosts, totalSelectedEquipmentsDepreciation]);

  const financialReserveValue = useMemo(() => {
    return baseServiceCost * (parsePercentage(financialReservePercentage) / 100);
  }, [baseServiceCost, financialReservePercentage]);

  const profitMarginValue = useMemo(() => {
    return baseServiceCost * (parsePercentage(profitMarginPercentage) / 100);
  }, [baseServiceCost, profitMarginPercentage]);

  const finalSuggestedPrice = useMemo(() => {
    return baseServiceCost + financialReserveValue + profitMarginValue;
  }, [baseServiceCost, financialReserveValue, profitMarginValue]);
  
  const resetForm = useCallback(() => {
    setServiceName('');
    setHours({ meeting: '', travel: '', event: '', editing: ''});
    setVariableCosts([{ id: uuidv4(), description: '', value: '' }]);
    setSelectedEquipments({});
    setFinancialReservePercentage('');
    setProfitMarginPercentage('');
  }, []);

  const handleSavePricedService = async () => {
    if (!serviceName.trim()) {
      toast({
        title: "Nome do Serviço Obrigatório",
        description: "Por favor, informe o nome do pacote ou serviço (Passo 2).",
        variant: "destructive",
      });
      document.getElementById('serviceName')?.focus();
      return;
    }
    if (baseServiceCost <= 0 && finalSuggestedPrice <=0) {
       toast({
        title: "Cálculo Incompleto",
        description: "Preencha os campos de horas e custos para calcular o preço.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingService(true);
    const pricedServiceData = {
      nome_servico: serviceName,
      custo_total_calculado: baseServiceCost,
      preco_final_sugerido: finalSuggestedPrice,
      reserva_financeira_percentual: parsePercentage(financialReservePercentage),
      margem_lucro_percentual: parsePercentage(profitMarginPercentage),
      detalhes_custos: {
        custo_por_hora: costPerHour,
        total_horas_dedicadas: totalDedicatedHours,
        detalhe_horas: { 
          reuniao_planejamento: parseFloat(hours.meeting) || 0, 
          deslocamento: parseFloat(hours.travel) || 0, 
          evento_sessaofotos: parseFloat(hours.event) || 0, 
          edicao_tratamento: parseFloat(hours.editing) || 0 
        },
        custos_variaveis_lista: variableCosts.filter(vc => vc.description.trim() && parseFloat(vc.value) > 0),
        soma_custos_variaveis: totalVariableCosts,
        equipamentos_selecionados_lista: equipments
          .filter(eq => selectedEquipments[eq.id])
          .map(eq => ({ id: eq.id, nome_equipamento: eq.nome_equipamento, depreciacao_mensal: eq.depreciacao_mensal })),
        soma_depreciacao_equipamentos: totalSelectedEquipmentsDepreciation,
      }
    };

    try {
      const savedPricedService = await addPricedService(pricedServiceData);
      
      if (savedPricedService) {
        const packageDescription = `Custo Base: ${formatCurrency(baseServiceCost)}. Reserva: ${parsePercentage(financialReservePercentage)}%. Lucro: ${parsePercentage(profitMarginPercentage)}%.`;
        
        const newServicePackage = {
          name: savedPricedService.nome_servico,
          price_cash_pix: savedPricedService.preco_final_sugerido,
          price_card: savedPricedService.preco_final_sugerido, 
          description: packageDescription,
          items_included: [], 
          cost: savedPricedService.custo_total_calculado,
        };
        
        await addServicePackage(newServicePackage);

        toast({
          title: "Sucesso Completo!",
          description: "Pacote precificado salvo e também adicionado à sua lista de Pacotes de Serviços!",
          className: "bg-green-500 text-white"
        });
      } else {
         toast({
          title: "Sucesso Parcial",
          description: "Pacote precificado salvo, mas houve um problema ao adicioná-lo aos Pacotes de Serviços.",
          variant: "warning",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o pacote precificado e/ou o pacote de serviço.",
        variant: "destructive",
      });
    } finally {
      setIsSavingService(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
      <header className="text-center">
        <DollarSign className="mx-auto h-16 w-16 text-primary mb-4 animate-pulse" />
        <h1 className="text-5xl sm:text-6xl font-extrabold titulo-gradiente-animado mb-3">
            Precifique seu Trabalho
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Um assistente passo a passo para calcular o preço perfeito para seus serviços, garantindo lucro e competitividade.
        </p>
      </header>

      <FixedCostsSection 
        fixedCosts={fixedCosts}
        dataLoading={dataLoading}
        onAddNew={handleAddNewFixedCost}
        onEdit={handleEditFixedCost}
        onDelete={handleDeleteFixedCost}
        totalMonthlyFixedCost={totalMonthlyFixedCost}
        costPerHour={costPerHour}
        formatCurrency={formatCurrency}
      />

      <FixedCostModal
        isOpen={isFixedCostModalOpen}
        onClose={() => { setIsFixedCostModalOpen(false); setEditingFixedCost(null); }}
        onSave={handleSaveFixedCost}
        fixedCostData={editingFixedCost}
        isLoading={isLoadingModal}
      />

      <ServiceDescriptionSection serviceName={serviceName} setServiceName={setServiceName} />
      
      <TimeCostSection hours={hours} setHours={setHours} totalDedicatedHours={totalDedicatedHours} />

      <VariableCostsSection 
        variableCosts={variableCosts}
        onAdd={handleAddVariableCost}
        onChange={handleVariableCostChange}
        onRemove={handleRemoveVariableCost}
      />

      <EquipmentSelectionSection
        equipments={equipments}
        selectedEquipments={selectedEquipments}
        onSelect={handleEquipmentSelection}
        dataLoading={dataLoading}
        formatCurrency={formatCurrency}
      />
      
      <BaseServiceCostCard 
        baseServiceCost={baseServiceCost}
        costPerHour={costPerHour}
        totalDedicatedHours={totalDedicatedHours}
        totalVariableCosts={totalVariableCosts}
        totalSelectedEquipmentsDepreciation={totalSelectedEquipmentsDepreciation}
        formatCurrency={formatCurrency}
      />

      <PricingStrategySection
        financialReservePercentage={financialReservePercentage}
        setFinancialReservePercentage={setFinancialReservePercentage}
        profitMarginPercentage={profitMarginPercentage}
        setProfitMarginPercentage={setProfitMarginPercentage}
        baseServiceCost={baseServiceCost}
        financialReserveValue={financialReserveValue}
        profitMarginValue={profitMarginValue}
        finalSuggestedPrice={finalSuggestedPrice}
        onSave={handleSavePricedService}
        isSavingService={isSavingService}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Precifique;