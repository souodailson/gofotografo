import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PWAInstaller = () => {
  const { toast } = useToast();

  const handleInstallClick = () => {
    let deferredPrompt;

    const beforeInstallPromptHandler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt();
    };

    const showInstallPrompt = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
            toast({
              title: "Aplicativo Instalado!",
              description: "O GO.FOTÓGRAFO foi adicionado à sua tela inicial.",
            });
          } else {
            console.log("User dismissed the install prompt");
          }
          deferredPrompt = null;
        });
      } else {
         toast({
            title: "Já é um App ou não suportado",
            description: "O aplicativo já pode estar instalado ou seu navegador não suporta esta ação. Tente 'Adicionar à Tela de Início' no menu do seu navegador.",
            variant: "default",
            duration: 7000
        });
      }
    };
    
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

    // Se o evento já foi disparado, precisamos de um jeito de pegar o prompt.
    // Esta é uma limitação, então vamos tentar acionar de qualquer forma e dar feedback.
    if (window.deferredPrompt) {
        deferredPrompt = window.deferredPrompt;
        showInstallPrompt();
    } else {
        toast({
            title: "Instalação",
            description: "Para instalar, use a opção 'Adicionar à Tela de Início' do seu navegador.",
            variant: "default",
            duration: 7000
        });
    }

    // Cleanup
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    };
  };

  // Este componente não renderiza nada visível, apenas expõe a função de instalação.
  // Ele é chamado a partir de um botão no menu.
  // Vamos armazenar a função no objeto window para ser acessível globalmente.
  React.useEffect(() => {
    window.handlePWAInstall = handleInstallClick;

    // Para capturar o prompt para uso posterior
    const capturePrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);

    return () => {
      delete window.handlePWAInstall;
      window.removeEventListener('beforeinstallprompt', capturePrompt);
    };
  }, []);

  return null;
};

export default PWAInstaller;