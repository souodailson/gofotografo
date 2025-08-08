import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import { Mail, Send, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessageSent(true);
      toast({
        title: "Link Enviado! 📧",
        description: "Se uma conta existir para este email, um link de redefinição de senha foi enviado.",
        duration: 10000,
      });
    } catch (error) {
      toast({
        title: "Erro ao Enviar Email 🙁",
        description: error.message || "Não foi possível enviar o email de redefinição. Tente novamente.",
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

  return (
    <AuthLayout title="Redefinir Senha" description="Insira seu email para receber um link de redefinição.">
      {messageSent ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Verifique seu Email</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Enviamos um link para {email}. Siga as instruções no email para redefinir sua senha.
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Login
            </Link>
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1, duration: 0.3 }}>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="pl-10"
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg py-3 text-base font-semibold" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </Button>
          </motion.div>
        </form>
      )}
      {!messageSent && (
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-medium text-neutral-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
            Faça login
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;