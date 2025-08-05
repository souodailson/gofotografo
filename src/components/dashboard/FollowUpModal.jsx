import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Modelos de mensagem por tipo de lembrete.  Cada função recebe o
 * objeto reminder e retorna um array de strings com templates prontos.
 */
const messageTemplates = {
  payment_overdue: (r) => [
    `Olá ${r.clientName}, estou passando para lembrar que o pagamento referente ao seu serviço ${r.service} no valor de ${r.amount} está atrasado. Por favor, entre em contato para regularizar.`,
    `Olá ${r.clientName}, seu pagamento de ${r.amount} referente a ${r.service} está vencido. Caso já tenha quitado, desconsidere. Do contrário, preciso que regularize, tudo bem?`,
  ],
  payment_due: (r) => [
    `Olá ${r.clientName}, tudo bem? O pagamento referente ao seu serviço ${r.service} no valor de ${r.amount} vence em ${r.dueInDays} dia(s). Estou à disposição para dúvidas.`,
    `Oi ${r.clientName}! Lembrando que seu pagamento de ${r.amount} (${r.service}) vence em ${r.dueInDays} dia(s). Qualquer coisa estou por aqui.`,
  ],
  expense_overdue: (r) => [
    `Conta ${r.service} (R$ ${r.amount}) venceu em ${r.dueDateStr}. Programe-se para regularizar.`,
  ],
  expense_due: (r) => [
    `Alerta: sua conta ${r.service} no valor de R$ ${r.amount} vence em ${r.dueInDays} dia(s).`,
  ],
  birthday: (r) => [
    `Olá ${r.clientName}, feliz aniversário! Desejo muitas felicidades e sucesso. Se precisar de um ensaio fotográfico, estarei à disposição com condições especiais!`,
    `Feliz aniversário, ${r.clientName}! Que tal aproveitar a data para registrar esse momento com um ensaio exclusivo?`,
  ],
  default: (r) => [
    `Olá ${r.clientName}, tudo bem?`,
  ],
};

/**
 * Componente de modal para selecionar e enviar uma mensagem de follow-up.
 *
 * Props:
 * - open: booleano indicando se o modal está visível.
 * - onOpenChange: função chamada ao abrir/fechar o modal.
 * - reminder: lembrete selecionado, contendo clientName, clientPhone, service, amount, etc.
 */
const FollowUpModal = ({ open, onOpenChange, reminder }) => {
  const templates = React.useMemo(() => {
    if (!reminder) return [];
    const key = reminder.reminderType || 'default';
    const factory = messageTemplates[key] || messageTemplates.default;
    return factory(reminder);
  }, [reminder]);

  const [selectedMessage, setSelectedMessage] =
    React.useState('');

  // Define mensagem padrão ao abrir o modal
  React.useEffect(() => {
    if (templates && templates.length > 0) {
      setSelectedMessage(templates[0]);
    }
  }, [templates]);

  const handleSend = () => {
    if (
      !selectedMessage ||
      !reminder?.clientPhone
    ) {
      return;
    }
    // Remove caracteres não numéricos do telefone
    const phone = reminder.clientPhone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      selectedMessage
    )}`;
    window.open(url, '_blank');
    onOpenChange(false);
  };

  if (!reminder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Enviar mensagem para {reminder.clientName}
          </DialogTitle>
          <DialogDescription>
            Selecione uma mensagem de follow‑up para enviar via
            WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-40">
          {templates.map((msg, idx) => (
            <div
              key={idx}
              onClick={() =>
                setSelectedMessage(msg)
              }
              className={`p-2 mb-2 border rounded-md cursor-pointer ${
                selectedMessage === msg
                  ? 'bg-accent'
                  : ''
              }`}
            >
              {msg}
            </div>
          ))}
        </ScrollArea>
        <DialogFooter className="space-x-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={!selectedMessage}
          >
            Enviar via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpModal;
