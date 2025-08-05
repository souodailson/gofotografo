import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
 import {
  BellRing,
  Gift,
  Cake,
  Users,
  Sparkles,
  PhoneOutgoing,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Item de lembrete individual.  Exibe ícone, título, descrição e data.
 * Mostra sempre o botão de follow‑up se a função onFollowUp estiver definida,
 * independentemente de haver telefone cadastrado.
 */
const ReminderItem = ({
  icon: Icon,
  title,
  description,
  date,
  color,
  reminder,
  onFollowUp,
  layout,
}) => {
  const getResponsiveClasses = () => {
    if (!layout || layout.h >= 4) {
      return {
        icon: 'w-3.5 h-3.5',
        title: 'text-xs',
        desc: 'text-[11px]',
      };
    }
    return {
      icon: 'w-3 h-3',
      title: 'text-[11px]',
      desc: 'text-[10px]',
    };
  };
  const responsive = getResponsiveClasses();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-2 p-1.5 mb-1 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div
        className={cn(
          `p-1.5 rounded-full text-primary-foreground`,
          color,
          layout?.h < 4 && 'p-1'
        )}
      >
        {Icon && <Icon className={responsive.icon} />}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-semibold text-foreground truncate',
            responsive.title
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-muted-foreground mt-0.5 truncate',
            responsive.desc
          )}
        >
          {description}
        </p>
        {date && (
          <p
            className={cn(
              'text-muted-foreground italic',
              responsive.desc
            )}
          >
            Data:{' '}
            {format(parseISO(date), 'dd/MM', {
              locale: ptBR,
            })}
          </p>
        )}
      </div>
      {/* Botão de follow-up sempre visível se onFollowUp for passado */}
      {onFollowUp && (
        // No NotificationItem e ReminderItem:
<button
  onClick={() => onFollowUp(reminder)}
  className="p-1"
  title="Follow-up"
>
  <img
    src="https://cdn-icons-png.flaticon.com/512/16566/16566143.png"
    alt="WhatsApp"
    className="w-4 h-4"
  />
</button>

      )}
    </motion.div>
  );
};

/**
 * Card de lembretes e oportunidades.  Aceita `onFollowUp` para tratar follow-up.
 */
const RemindersCard = ({
  reminders,
  isLoading,
  isDemo = false,
  layout,
  onFollowUp,
}) => {
  // Mapeia lembretes antigos para formato interno
  const getReminderDetails = (reminder) => {
    if (reminder.icon) {
      return {
        icon: reminder.icon,
        title: reminder.title,
        description: reminder.description,
        date: reminder.date,
        color: reminder.color || 'bg-primary',
      };
    }
    switch (reminder.type) {
      case 'BIRTHDAY':
        return {
          icon: Gift,
          title: `Aniversário de ${reminder.clientName}`,
          description:
            'Envie uma mensagem ou cupom.',
          date: reminder.date,
          color: 'bg-pink-500',
        };
      case 'WEDDING_ANNIVERSARY':
        return {
          icon: Sparkles,
          title: `Aniv. Casamento: ${reminder.clientName}`,
          description:
            'Ofereça um ensaio de casal.',
          date: reminder.date,
          color: 'bg-red-500',
        };
      case 'CHILD_BIRTHDAY':
        return {
          icon: Cake,
          title: `Aniv. de ${
            reminder.childName || 'Filho(a)'
          }`,
          description:
            'Sugira um ensaio em família.',
          date: reminder.date,
          color: 'bg-blue-500',
        };
      default:
        return {
          icon: BellRing,
          title: 'Lembrete',
          description: reminder.clientName,
          date: reminder.date,
          color: 'bg-primary',
        };
    }
  };

  // Dados de demonstração
  const demoReminders = [
    {
      type: 'BIRTHDAY',
      clientName: 'Ana Silva',
      date: new Date(
        new Date().setDate(
          new Date().getDate() + 5
        )
      ).toISOString(),
    },
    {
      type: 'WEDDING_ANNIVERSARY',
      clientName: 'Carlos e Bia',
      date: new Date(
        new Date().setDate(
          new Date().getDate() + 12
        )
      ).toISOString(),
    },
  ];

  const finalReminders = isDemo
    ? demoReminders
    : reminders;

  const getResponsiveClasses = () => {
    if (!layout || layout.h >= 4)
      return {
        title: 'text-sm',
        icon: 'w-4 h-4',
      };
    return {
      title: 'text-xs',
      icon: 'w-3.5 h-3.5',
    };
  };
  const responsive = getResponsiveClasses();

  return (
    <Card className="h-full flex flex-col shadow-sm border-border bg-card/80 backdrop-blur-sm p-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0 border-b border-border/50 mb-2">
        <CardTitle
          className={cn(
            'font-semibold text-foreground flex items-center',
            responsive.title
          )}
        >
          <BellRing
            className={cn(
              'mr-2',
              responsive.icon,
              'text-button-primary-foreground'
            )}
          />
          Lembretes e Oportunidades
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 flex-grow overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-1 rounded-lg"
              >
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : finalReminders &&
          finalReminders.length > 0 ? (
          <ScrollArea className="h-full pr-2">
            <div className="pt-1">
              {finalReminders.map(
                (reminder, index) => {
                  const details =
                    getReminderDetails(reminder);
                  return (
                    <ReminderItem
                      key={index}
                      {...details}
                      reminder={reminder}
                      onFollowUp={onFollowUp}
                      layout={layout}
                    />
                  );
                }
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-2">
            <Users className="w-6 h-6 mb-2" />
            <p className="text-xs font-medium">
              Nenhum lembrete!
            </p>
            <p className="text-[10px]">
              Cadastre as datas dos clientes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RemindersCard;
