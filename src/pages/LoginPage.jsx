import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/components/auth/AuthLayout';
import { Mail, Lock, LogIn, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/authContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSettings } = useAuth();
  
  useEffect(() => {
    if (location.state?.showConfirmationMessage) {
      setEmail(location.state.email);
    }
  }, [location.state]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResendEmail(false);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }, {
        shouldCreateUser: false,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          setErrorMessage("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam).");
          setShowResendEmail(true);
        } else if (error.message === 'Invalid login credentials') {
          setErrorMessage("Credenciais inválidas. Verifique seu email e senha.");
        } else {
          setErrorMessage(error.message || "Ocorreu um erro ao tentar fazer login.");
        }
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        if(!rememberMe) {
          await supabase.auth.setSession(data.session);
        }

        toast({
          title: "Login bem-sucedido! 🎉",
          description: "Redirecionando para o painel...",
        });
        
        await refreshSettings();
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setErrorMessage("Ocorreu um problema inesperado. Tente novamente.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!email) {
      setErrorMessage("Por favor, insira seu email para reenviar a confirmação.");
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      toast({
        title: "Email de confirmação reenviado! 🚀",
        description: "Verifique sua caixa de entrada (e spam).",
      });
      setShowResendEmail(false);
    } catch (error) {
      setErrorMessage(error.message || "Não foi possível reenviar o email de confirmação.");
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AuthLayout title="Bem-vindo de Volta!" description="Acesse sua conta para gerenciar seu negócio.">
      <form onSubmit={handleLogin} className="space-y-6">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md relative flex items-start"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="block sm:inline text-sm">{errorMessage}</span>
          </motion.div>
        )}
        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1, duration: 0.3 }}>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.2, duration: 0.3 }}>
          <Label htmlFor="password">Senha</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="pl-10"
            />
          </div>
        </motion.div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
             <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} />
             <Label htmlFor="remember-me" className="font-medium">Mantenha-me conectado</Label>
          </div>
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Esqueceu a senha?
          </Link>
        </div>

        {showResendEmail && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendConfirmationEmail}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Reenviar email de confirmação
            </Button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: showResendEmail ? 0.2 : 0.3, duration: 0.3 }}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </motion.div>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Cadastre-se aqui
        </Link>
      </p>
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>Ao continuar, você concorda com nossa{' '}
          <Link to="/politica-de-privacidade-e-dados" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
            Política de Privacidade e Dados
          </Link>.
        </p>
        <p className="mt-2">
            <Link to="/lp" className="underline hover:text-primary transition-colors">
                Conheça o GO.FOTÓGRAFO
            </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;