import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import GoalModal from '@/components/modals/GoalModal';
import GoalTransactionModal from '@/components/modals/GoalTransactionModal'; 
import { PlusCircle, MoreHorizontal, Edit3, Trash2, PiggyBank, AlertCircle, Target, Loader2, ArrowDownCircle, ArrowUpCircle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useMobileLayout from '@/hooks/useMobileLayout';

const GoalCard = ({ goal, onEdit, onDelete, onDeposit, onWithdraw, toast }) => {
  const progress = goal.valor_meta > 0 ? (goal.saldo_atual / goal.valor_meta) * 100 : 0;
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-customGreen';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="gradient-border-card"
    >
      <Card className="card-content-inner shadow-lg flex flex-col h-full">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center">
              {goal.icone && <span className="mr-2 text-2xl">{goal.icone}</span>}
              {goal.nome_meta}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Meta: {formatCurrency(goal.valor_meta)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)} className="cursor-pointer">
                <Edit3 className="mr-2 h-4 w-4" /> Editar Meta
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => onDeposit(goal)} className="cursor-pointer">
                <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" /> Depositar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWithdraw(goal)} className="cursor-pointer">
                <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" /> Sacar / Gastar
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 hover:!text-red-700 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Meta
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a meta "{goal.nome_meta}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(goal.id)} className="bg-red-600 hover:bg-red-700">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <Progress value={progress} className="w-full h-3" indicatorClassName={getProgressColor(progress)} />
            </div>
            <p className="text-sm font-medium text-foreground text-center">
              {formatCurrency(goal.saldo_atual)} / {formatCurrency(goal.valor_meta)} 
              <span className={`ml-1 font-semibold ${progress >= 100 ? 'text-green-500' : 'text-customPurple'}`}>
                ({progress.toFixed(1)}%)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ReservaInteligente = () => {
  const { 
    savingGoals, 
    addSavingGoal, 
    updateSavingGoal, 
    deleteSavingGoal, 
    updateSavingGoalBalance, 
    loading: dataLoading, 
    refreshData, 
    user 
  } = useData();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [currentTransactionGoal, setCurrentTransactionGoal] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit'); 
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDetails, setReminderDetails] = useState({ title: '', message: '' });
  const { toast } = useToast();
  const { isMobile } = useMobileLayout();

  useEffect(() => {
    if (user?.id && !dataLoading) {
       refreshData(user, 'metas_reserva');
    }
  }, [user?.id, refreshData]);

  const handleAddNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (id) => {
    setIsLoadingAction(true);
    try {
      await deleteSavingGoal(id);
      toast({ title: "Sucesso!", description: "Meta de reserva excluída." });
    } catch (error) {
      toast({ title: "Erro ao excluir", description: error.message || "Não foi possível excluir a meta.", variant: "destructive" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSaveGoal = async (formData) => {
    setIsLoadingAction(true);
    const dataToSave = {
      nome_meta: formData.nome_meta,
      valor_meta: parseFloat(formData.valor_meta) || 0,
      icone: formData.icone || null,
    };

    try {
      if (editingGoal) {
        await updateSavingGoal(editingGoal.id, dataToSave);
        toast({ title: "Sucesso!", description: "Meta de reserva atualizada." });
      } else {
        await addSavingGoal({ ...dataToSave, saldo_atual: 0 });
        toast({ title: "Sucesso!", description: "Nova meta de reserva adicionada." });
      }
      setIsGoalModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      toast({ title: "Erro ao salvar meta", description: error.message || "Não foi possível salvar a meta.", variant: "destructive" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleOpenTransactionModal = (goal, type) => {
    setCurrentTransactionGoal(goal);
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (formData) => {
    if (!currentTransactionGoal) return;
    setIsLoadingAction(true);
    const amount = parseFloat(formData.valor);
    const description = formData.descricao;

    try {
      await updateSavingGoalBalance(currentTransactionGoal.id, amount, description, transactionType);
      toast({ title: "Sucesso!", description: `${transactionType === 'deposit' ? 'Depósito' : 'Saque'} registrado e saldo da meta atualizado.` });
      setIsTransactionModalOpen(false);
      setCurrentTransactionGoal(null);

      setReminderDetails({
        title: "Ação Registrada com Sucesso!",
        message: transactionType === 'deposit' 
          ? "Lembre-se: esta plataforma é uma ferramenta de organização. Para que sua reserva funcione de verdade, não se esqueça de transferir este valor na sua conta bancária real destinada às suas reservas!"
          : "Lembre-se de registrar esta retirada também no seu controle bancário real para manter tudo sincronizado."
      });
      setShowReminderModal(true);

    } catch (error) {
      toast({ title: `Erro ao ${transactionType === 'deposit' ? 'depositar' : 'sacar'}`, description: error.message || `Não foi possível registrar o ${transactionType === 'deposit' ? 'depósito' : 'saque'}.`, variant: "destructive" });
    } finally {
      setIsLoadingAction(false);
    }
  };
  
  const totalMetaValue = savingGoals.reduce((sum, goal) => sum + Number(goal.valor_meta), 0);
  const totalCurrentBalance = savingGoals.reduce((sum, goal) => sum + Number(goal.saldo_atual), 0);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className={isMobile ? "hidden" : ""}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground flex items-center titulo-gradiente">
            <PiggyBank className="w-10 h-10 mr-3 text-customPurple animate-bounce" />
            Reserva Inteligente
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Crie suas "caixinhas" de economia e acompanhe o progresso para alcançar seus objetivos financeiros.
          </p>
        </div>
        <Button onClick={handleAddNewGoal} className="btn-custom-gradient shadow-lg hover:opacity-90 transition-opacity">
          <PlusCircle className="w-5 h-5 mr-2" />
          Nova Meta
        </Button>
      </header>

      {savingGoals.length > 0 && (
        <Card className="shadow-lg border-l-4 border-customGreen dark:border-customPurple">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center">
              <Target className="w-6 h-6 mr-2 text-customGreen" />
              Resumo das Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total das Metas</p>
              <p className="text-2xl font-bold text-customPurple">{formatCurrency(totalMetaValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Total Atual</p>
              <p className="text-2xl font-bold text-customGreen">{formatCurrency(totalCurrentBalance)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {dataLoading && savingGoals.length === 0 && !user?.id ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Loader2 className="h-16 w-16 text-customPurple animate-spin mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">Carregando suas metas...</p>
        </div>
      ) : !dataLoading && savingGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-border rounded-lg bg-card">
          <AlertCircle className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">Nenhuma meta de reserva criada ainda.</p>
          <p className="text-muted-foreground mt-2">Clique em "+ Nova Meta" para começar a planejar seus sonhos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {savingGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEditGoal} 
                onDelete={handleDeleteGoal} 
                onDeposit={() => handleOpenTransactionModal(goal, 'deposit')}
                onWithdraw={() => handleOpenTransactionModal(goal, 'withdraw')}
                toast={toast} 
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => { setIsGoalModalOpen(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        goalData={editingGoal}
        isLoading={isLoadingAction}
      />
      <GoalTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => { setIsTransactionModalOpen(false); setCurrentTransactionGoal(null); }}
        onSave={handleSaveTransaction}
        goalData={currentTransactionGoal}
        transactionType={transactionType}
        isLoading={isLoadingAction}
      />
      <AlertDialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Info className="w-6 h-6 mr-2 text-customPurple" />
              {reminderDetails.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              {reminderDetails.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowReminderModal(false)}>Entendi!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReservaInteligente;