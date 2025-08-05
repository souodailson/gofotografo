import React from 'react';
import { User, Briefcase } from 'lucide-react';

const ClientDetailHeader = ({ clientType, clientName, clientStatus }) => {
  const ClientTypeIcon = clientType === 'Pessoa Jurídica' ? Briefcase : User;

  return (
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-customPurple to-customGreen rounded-full flex items-center justify-center text-white text-3xl mr-4">
        <ClientTypeIcon className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{clientName}</h1>
        <p className="text-muted-foreground">{clientType} - {clientStatus}</p>
      </div>
    </div>
  );
};

export default ClientDetailHeader;