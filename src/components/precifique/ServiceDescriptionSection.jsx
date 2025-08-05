import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const ServiceDescriptionSection = ({ serviceName, setServiceName }) => {
  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <Package className="w-7 h-7 mr-3 text-customPurple" />
            Passo 2: Descreva seu Serviço
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Qual nome você dará a este pacote ou serviço?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="serviceName" className="text-muted-foreground">Nome do Pacote ou Serviço*</Label>
          <Input 
            id="serviceName" 
            value={serviceName} 
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Ex: Ensaio de Gestante - Pacote Ouro" 
            className="mt-1 bg-input border-border focus:border-customPurple"
          />
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default ServiceDescriptionSection;