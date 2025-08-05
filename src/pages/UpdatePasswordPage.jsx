import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This event means the user has clicked the recovery link
        // No specific action needed here other than allowing password update
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      
      setSuccess(true);
      toast({
        title: "Senha Atualizada! 🎉",
        description: "Sua senha foi alterada com sucesso. Você pode fazer login agora.",
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || "Não foi possível atualizar a senha. O link pode ter expirado ou ser inválido.");
      toast({
        title: "Erro ao Atualizar Senha 🙁",
        description: err.message || "Não foi possível atualizar a senha. O link pode ter expirado ou ser inválido.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0 },
  };

  if (success) {
    return (
      <AuthLayout title="Senha Atualizada!" description="Sua senha foi alterada com sucesso.">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Você será redirecionado para a página de login em breve.
          </p>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
            Ir para Login Agora
          </Button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Atualizar Senha" description="Crie uma nova senha para sua conta.">
      <form onSubmit={handleUpdatePassword} className="space-y-6">
        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1, duration: 0.3 }}>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              className="pl-10"
            />
          </div>
        </motion.div>

        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.2, duration: 0.3 }}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirme a Nova Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              required
              className="pl-10"
            />
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm"
          >
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg py-3 text-base font-semibold" disabled={loading}>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Lock className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default UpdatePasswordPage;