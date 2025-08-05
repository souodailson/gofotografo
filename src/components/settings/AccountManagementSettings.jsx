import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';

const AccountManagementSettings = () => {
  const { toast } = useToast();
  const { user, signOut } = useData();

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-user-account');

      if (error) {
        throw error;
      }
      
      toast({
        title: "Conta excluída",
        description: "Sua conta e todos os dados foram excluídos com sucesso. Você será desconectado.",
      });

      // Aguarda um pouco para o usuário ler o toast e depois desloga
      setTimeout(() => {
        signOut();
      }, 3000);

    } catch (error) {
      toast({
        title: "Erro ao excluir a conta",
        description: `Não foi possível processar sua solicitação: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-lg text-foreground">Gerenciamento de Dados e Conta</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Exporte seus dados ou exclua sua conta permanentemente.
      </p>

      <div className="space-y-4">
        <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-destructive">Excluir Conta</h4>
              <p className="text-sm text-destructive/80 mb-3">
                Esta ação é irreversível. Todos os seus dados, incluindo clientes, trabalhos e informações financeiras, serão permanentemente apagados.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir minha conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso irá apagar permanentemente sua conta e remover seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sim, excluir conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementSettings;