import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Briefcase, Target, Calendar } from 'lucide-react';
import useCardHoverEffect from '@/hooks/useCardHoverEffect';
import { cn } from '@/lib/utils';
import useMobileLayout from '@/hooks/useMobileLayout';

const IconMap = {
  Users,
  FileText,
  Briefcase,
  Target,
  Calendar
};

const SmallStatCard = ({ title, value, icon, iconColor, onClick, isPersonalizing, layout }) => {
  const cardRef = useCardHoverEffect();
  const IconComponent = IconMap[icon] || Users;
  const { isMobile } = useMobileLayout();

  const getResponsiveClasses = () => {
    if (!layout) return { value: 'text-lg', title: 'text-xs', iconContainer: 'w-7 h-7 mb-1', icon: 'w-4 h-4' };
    const { h, w } = layout;
    if (h <= 1 || w <= 2) {
        return { value: 'text-base', title: 'text-[10px] leading-tight', iconContainer: 'w-6 h-6 mb-0.5', icon: 'w-3.5 h-3.5' };
    }
    return { value: 'text-lg', title: 'text-xs', iconContainer: 'w-7 h-7 mb-1', icon: 'w-4 h-4' };
  };

  const responsiveClasses = getResponsiveClasses();

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-xl p-3 shadow-sm border border-border/50 text-center card-hover-effect relative h-full flex flex-col justify-center items-center"
      onClick={!isPersonalizing ? onClick : undefined}
      style={{ cursor: isPersonalizing ? 'grab' : 'pointer' }}
    >
      <div className={cn('rounded-lg flex items-center justify-center mx-auto', responsiveClasses.iconContainer)}>
        <IconComponent className={cn(responsiveClasses.icon, iconColor)} />
      </div>
      <p className={cn('font-bold text-foreground', responsiveClasses.value)}>{value}</p>
      <p className={cn('text-muted-foreground mt-0.5', responsiveClasses.title)}>{title}</p>
    </motion.div>
  );
};

export default SmallStatCard;