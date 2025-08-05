import React, { useState, useEffect } from 'react';
import { 
  AlertDialog as Dialog, 
  AlertDialogContent as DialogContent, 
  AlertDialogHeader as DialogHeader, 
  AlertDialogTitle as DialogTitle, 
  AlertDialogDescription as DialogDescription, 
  AlertDialogFooter as DialogFooter 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const EnableMFAModal = ({ isOpen, onClose, enrollData, onSuccess, toast }) => {
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Set the QR code SVG from enrollData when available
  useEffect(() => {
    if (enrollData?.totp?.qr_code) {
      setQrCodeSvg(enrollData.totp.qr_code);
    }
  }, [enrollData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!verificationCode.trim()) {
      setError("Por favor, insira o código de verificação.");
      return;
    }
    setIsVerifying(true);
    try {
      // Start the MFA challenge (if required by Supabase for TOTP)
      const { error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollData.id });
      if (challengeError) throw challengeError;

      // Verify the code for the given factor
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        code: verificationCode,
      });
      if (verifyError) throw verifyError;

      // If successful, call the onSuccess handler (e.g., to refresh user session or state)
      onSuccess();
    } catch (err) {
      console.error("Error verifying MFA:", err);
      setError(err.message || "Código de verificação inválido ou erro ao ativar 2FA.");
      toast({
        title: "Erro ao verificar MFA",
        description: "Não foi possível verificar o código. Verifique e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ativar Autenticação de Dois Fatores</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code abaixo com um aplicativo autenticador e insira o código gerado para ativar o 2FA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-6">
            {qrCodeSvg ? (
              <div 
                className="mx-auto w-48 h-48 border" 
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
              />
            ) : (
              <p className="text-sm text-center">Gerando QR Code...</p>
            )}

            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium">
                Código de Verificação
              </label>
              <Input
                id="mfa-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Insira o código do autenticador"
              />
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isVerifying}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ativar 2FA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnableMFAModal;
