// src/components/settings/EnableMFAModal.jsx
import React, { useState, useEffect } from "react";
import {
  AlertDialog as Dialog,
  AlertDialogContent as DialogContent,
  AlertDialogHeader as DialogHeader,
  AlertDialogTitle as DialogTitle,
  AlertDialogDescription as DialogDescription,
  AlertDialogFooter as DialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SafeHTML from "@/components/SafeHTML.jsx";

const EnableMFAModal = ({ isOpen, onClose, enrollData, onSuccess, toast }) => {
  const [qrCodeSvg, setQrCodeSvg] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  // carrega o SVG do QR assim que o enrollData chegar
  useEffect(() => {
    if (enrollData?.totp?.qr_code) {
      setQrCodeSvg(enrollData.totp.qr_code);
    } else {
      setQrCodeSvg("");
    }
  }, [enrollData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode.trim()) {
      setError("Por favor, insira o código de verificação.");
      return;
    }
    if (!enrollData?.id) {
      setError("Fator TOTP não encontrado. Tente iniciar o processo novamente.");
      return;
    }

    setIsVerifying(true);
    try {
      // alguns fluxos do Supabase pedem challenge antes do verify (não faz mal chamar)
      const { error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });
      if (challengeError) {
        // em alguns casos o challenge não é necessário: só loga e segue
        console.warn("MFA challenge aviso:", challengeError.message);
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        code: verificationCode.trim(),
      });
      if (verifyError) throw verifyError;

      // sucesso
      if (typeof onSuccess === "function") onSuccess();
      if (typeof toast === "function") {
        toast({
          title: "2FA ativada",
          description: "Sua autenticação em duas etapas foi ativada com sucesso.",
        });
      }
      onClose?.();
    } catch (err) {
      console.error("Erro ao verificar MFA:", err);
      const msg =
        err?.message ||
        "Código de verificação inválido ou erro ao ativar 2FA.";
      setError(msg);
      if (typeof toast === "function") {
        toast({
          title: "Erro ao verificar MFA",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ativar Autenticação de Dois Fatores</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code abaixo com um aplicativo autenticador e insira o
            código gerado para ativar o 2FA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-6">
            {qrCodeSvg ? (
              <div className="mx-auto w-48 h-48 border overflow-hidden">
                {/* Render seguro do SVG do QR */}
                <SafeHTML className="prose" html={qrCodeSvg} />
              </div>
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
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isVerifying}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ativar 2FA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnableMFAModal;
