import React from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FreelaMessages = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="text-gray-600">Sistema de mensagens em desenvolvimento</p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Sistema de Mensagens
          </h3>
          <p className="text-gray-500 mb-4">
            Em breve você poderá se comunicar diretamente com outros profissionais e clientes através da plataforma.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Funcionalidade em desenvolvimento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelaMessages;