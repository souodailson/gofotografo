import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }
      
      if (!user) {
        throw new Error("Usuário não encontrado após o login.");
      }

      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError) {
        if (settingsError.code === 'PGRST116') {
          throw new Error("Configurações não encontradas para este usuário.");
        }
        throw settingsError;
      }

      if (settings && settings.role === 'ADMIN') {
        localStorage.setItem('gofotografo_admin_auth', 'true');
        toast({
          title: "Login de Admin bem-sucedido! 🚀",
          description: "Redirecionando para o painel de controle...",
        });
        navigate('/control-acess/dashboard');
      } else {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Esta conta não possui privilégios de administrador.");
      }

    } catch (error) {
      console.error("Admin login error:", error);
      let displayMessage = "Credenciais de administrador inválidas ou erro inesperado.";
      if (error.message.includes("privilégios de administrador")) {
        displayMessage = error.message;
      } else if (error.message.includes("Invalid login credentials")) {
        displayMessage = "Email ou senha incorretos.";
      }
      setErrorMessage(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Acesso Restrito</h1>
            <p className="text-muted-foreground mt-2">Painel de Controle GO.FOTÓGRAFO</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md flex items-start"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errorMessage}</span>
              </motion.div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
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
            </div>

            <Button type="submit" className="w-full shadow-lg py-3 text-base font-semibold" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Acessando...' : 'Acessar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;