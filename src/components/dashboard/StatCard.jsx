import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ShieldCheck, Landmark, Wallet, Receipt, BarChart, Calendar } from 'lucide-react';
import useCardHoverEffect from '@/hooks/useCardHoverEffect';
import { cn } from '@/lib/utils';
import useMobileLayout from '@/hooks/useMobileLayout';

const IconMap = {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Landmark,
  Wallet,
  Receipt,
  BarChart,
  Calendar,
};

const StatCard = ({ title, value, icon, color, onClick, isPersonalizing, layout, iconUrl }) => {
  const cardRef = useCardHoverEffect();
  const IconComponent = IconMap[icon] || DollarSign;
  const { isMobile } = useMobileLayout();

  const getResponsiveClasses = () => {
    if (!layout) return { title: 'text-[11px]', value: 'text-xl', icon: 'w-3.5 h-3.5' };
    const { h, w } = layout;

    if (h <= 1 || w <= 2) {
      return { title: 'text-[10px] leading-tight', value: 'text-base', icon: 'w-3 h-3' };
    }
    if (w <= 3) {
      return { title: 'text-[11px] leading-tight', value: 'text-xl', icon: 'w-3.5 h-3.5' };
    }
    return { title: 'text-xs', value: 'text-2xl', icon: 'w-4 h-4' };
  };

  const responsiveClasses = getResponsiveClasses();

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-card rounded-xl shadow-sm border border-border/50 p-3 flex flex-col justify-between h-full card-hover-effect',
        !isPersonalizing && 'cursor-pointer'
      )}
      onClick={!isPersonalizing ? onClick : undefined}
    >
      <div className="flex justify-between items-start">
        <h3 className={cn('font-medium text-muted-foreground truncate', responsiveClasses.title)} title={title}>{title}</h3>
        {iconUrl ? (
          <img src={iconUrl} alt={title} className={cn(responsiveClasses.icon, 'object-contain')} />
        ) : (
          <IconComponent className={cn(responsiveClasses.icon, color)} />
        )}
      </div>
      <div>
        <p className={cn('font-bold text-foreground truncate', responsiveClasses.value)} title={typeof value === 'string' && value.startsWith('R$') ? value : ''}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;