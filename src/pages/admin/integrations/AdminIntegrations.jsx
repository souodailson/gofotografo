import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminIntegrations = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integrações de Marketing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pixel do Facebook</CardTitle>
          <CardDescription>Conecte seu Pixel para rastrear eventos e otimizar suas campanhas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook-pixel-id">ID do Pixel do Facebook</Label>
            <Input id="facebook-pixel-id" placeholder="Cole seu ID do Pixel aqui" />
          </div>
          <Button>Salvar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics</CardTitle>
          <CardDescription>Conecte sua conta do Google Analytics para obter insights sobre o tráfego do site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="google-analytics-id">ID de Acompanhamento do Google Analytics</Label>
            <Input id="google-analytics-id" placeholder="Ex: UA-12345678-1" />
          </div>
          <Button>Salvar</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntegrations;