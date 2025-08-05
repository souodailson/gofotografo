import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, Loader2, Send } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [location.search]);

  const checkPasswordStrength = (pass) => {
    let score = 0;
    let feedback = [];

    if (pass.length < 8) {
      feedback.push("Pelo menos 8 caracteres");
    } else {
      score++;
    }

    if (/[A-Z]/.test(pass)) {
      score++;
    } else {
      feedback.push("Letra maiúscula");
    }

    if (/[a-z]/.test(pass)) {
      score++;
    } else {
      feedback.push("Letra minúscula");
    }

    if (/[0-9]/.test(pass)) {
      score++;
    } else {
      feedback.push("Número");
    }

    if (/[^A-Za-z0-9]/.test(pass)) {
      score++;
    } else {
      feedback.push("Caractere especial");
    }
    
    setPasswordStrength({ score, feedback: feedback.join(', ') });
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    if (passwordStrength.score < 4) {
      toast({
        title: "Senha Fraca",
        description: "Sua senha não atende aos requisitos mínimos de segurança.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    const options = {
      data: {
        full_name: fullName,
      },
    };
    
    // We don't pass referred_by here anymore to avoid the trigger issue.
    // It will be handled by an edge function call after successful signup.

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Usuário já existe",
          description: "Este e-mail já está cadastrado. Tente fazer login.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If signup is successful and there's a referral code, call the edge function
      if (data.user && referralCode) {
        const { error: referralError } = await supabase.functions.invoke('handle-new-user-referral', {
          body: {
            record: {
              id: data.user.id,
              email: data.user.email,
              raw_user_meta_data: {
                full_name: fullName,
                referred_by: referralCode,
              },
            },
          },
        });
        if (referralError) {
          // Log the error but don't block the user, as the account is already created.
          console.error("Erro ao processar indicação:", referralError);
          toast({
              title: "Aviso de Indicação",
              description: "Sua conta foi criada, mas houve um problema ao registrar sua indicação. Contate o suporte se necessário.",
              variant: "default"
          });
        }
      }

      setSignupSuccess(true);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!email) {
      toast({ title: "Erro", description: "O campo de e-mail está vazio.", variant: "destructive" });
      return;
    }
    setLoading(true);
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
    } catch (error) {
      toast({ title: "Erro ao reenviar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const PasswordStrengthIndicator = () => {
    const levelColors = ['bg-gray-200', 'bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-green-500'];
    const levelText = ['','Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];

    return (
      <div className="w-full mt-1">
        <div className="flex w-full h-1.5 rounded-full overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 mr-1 last:mr-0">
              <div className={`h-full rounded-full transition-colors ${i < passwordStrength.score ? levelColors[passwordStrength.score] : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
          ))}
        </div>
        {password && (
            <p className={`text-xs mt-1 ${passwordStrength.score < 3 ? 'text-red-500' : 'text-green-500'}`}>
                {passwordStrength.score >= 4 ? `Força: ${levelText[passwordStrength.score]}` : `Falta: ${passwordStrength.feedback}`}
            </p>
        )}
      </div>
    );
  };
  
  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {signupSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Confirmação Necessária!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Enviamos um link de confirmação para <span className="font-semibold text-primary">{email}</span>.
              Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
            </p>
            <div className="mt-6 space-y-4">
              <Button className="w-full" onClick={() => navigate('/login')}>
                Já confirmei, ir para Login
              </Button>
               <Button variant="outline" className="w-full" onClick={handleResendConfirmationEmail} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                Reenviar e-mail
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <h2 className="text-2xl font-bold leading-9 tracking-tight text-foreground">
                Crie sua conta
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/90">
                  Faça login
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSignUp} className="space-y-4">
                 <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="mt-2">
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Endereço de e-mail</Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="mt-2 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                    </button>
                  </div>
                  <PasswordStrengthIndicator />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <div className="mt-2 relative">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                    </button>
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar conta'}
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/politica-de-privacidade-e-dados" className="font-semibold text-primary hover:text-primary/90">
                  Termos e Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default SignupPage;