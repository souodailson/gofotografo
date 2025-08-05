import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const TimeCostSection = ({ hours, setHours, totalDedicatedHours }) => {
  const handleHourChange = (field, value) => {
    setHours(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <Clock className="w-7 h-7 mr-3 text-customPurple" />
            Passo 3: Custo do Seu Tempo
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Quantas horas você dedicará a este serviço?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hoursMeeting">Horas de Reunião e Planejamento</Label>
              <Input id="hoursMeeting" type="number" value={hours.meeting} onChange={(e) => handleHourChange('meeting', e.target.value)} placeholder="Ex: 2" className="mt-1 bg-input border-border focus:border-customPurple"/>
            </div>
            <div>
              <Label htmlFor="hoursTravel">Horas de Deslocamento</Label>
              <Input id="hoursTravel" type="number" value={hours.travel} onChange={(e) => handleHourChange('travel', e.target.value)} placeholder="Ex: 1.5" className="mt-1 bg-input border-border focus:border-customPurple"/>
            </div>
            <div>
              <Label htmlFor="hoursEvent">Horas Fotografando no Evento</Label>
              <Input id="hoursEvent" type="number" value={hours.event} onChange={(e) => handleHourChange('event', e.target.value)} placeholder="Ex: 4" className="mt-1 bg-input border-border focus:border-customPurple"/>
            </div>
            <div>
              <Label htmlFor="hoursEditing">Horas de Edição e Tratamento</Label>
              <Input id="hoursEditing" type="number" value={hours.editing} onChange={(e) => handleHourChange('editing', e.target.value)} placeholder="Ex: 8" className="mt-1 bg-input border-border focus:border-customPurple"/>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-lg font-semibold">
              Total de Horas Dedicadas: <span className="text-customGreen">{totalDedicatedHours.toFixed(2)} horas</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default TimeCostSection;