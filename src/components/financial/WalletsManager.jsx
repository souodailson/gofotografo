import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Wallet, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import WalletModal from '@/components/modals/WalletModal';
import { formatCurrency } from '@/lib/utils';

const WalletsManager = () => {
    const { wallets, getWalletBalance, deleteWallet } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);
    const [walletToDelete, setWalletToDelete] = useState(null);
    const { toast } = useToast();

    const handleAddWallet = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleEditWallet = (wallet) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleDeleteWallet = async () => {
        if (!walletToDelete) return;
        try {
            await deleteWallet(walletToDelete.id);
            toast({ title: 'Carteira removida!', description: `A carteira "${walletToDelete.name}" foi removida com sucesso.` });
        } catch (error) {
            toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
        } finally {
            setWalletToDelete(null);
        }
    };
    
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 shadow-lg border border-border"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Minhas Carteiras</h3>
                    <Button onClick={handleAddWallet}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nova Carteira
                    </Button>
                </div>

                {wallets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <p>Nenhuma carteira encontrada.</p>
                        <p className="text-sm">Crie sua primeira carteira para organizar suas finanças.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                        {wallets.map(wallet => (
                            <motion.div
                                key={wallet.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <Card className="h-full group relative">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center">
                                            {wallet.icon_url ? (
                                                <img src={wallet.icon_url} alt={wallet.name} className="w-5 h-5 mr-2 object-contain" />
                                            ) : (
                                                <Landmark className="w-4 h-4 mr-2" />
                                            )}
                                            <span className="truncate" title={wallet.name}>{wallet.name}</span>
                                        </CardTitle>
                                        <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditWallet(wallet)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setWalletToDelete(wallet)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(getWalletBalance(wallet.id))}</div>
                                        <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <WalletModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        walletData={editingWallet}
                    />
                )}
            </AnimatePresence>

            <AlertDialog open={!!walletToDelete} onOpenChange={(open) => !open && setWalletToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a carteira "{walletToDelete?.name}"? Os lançamentos associados a ela não serão excluídos, mas perderão o vínculo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWalletToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWallet} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default WalletsManager;