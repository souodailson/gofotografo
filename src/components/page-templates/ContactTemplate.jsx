import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactTemplate = ({ page }) => {
  const options = page.page_options || {};

  return (
    <div className="max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-4 titulo-gradiente-animado">
          {page.title}
        </h1>
        {page.content?.find(b => b.type === 'p')?.content.text && (
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {page.content.find(b => b.type === 'p').content.text}
          </p>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {options.phone && (
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">Telefone</h4>
                    <a href={`tel:${options.phone}`} className="text-muted-foreground hover:text-primary">{options.phone}</a>
                  </div>
                </div>
              )}
              {options.email && (
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <a href={`mailto:${options.email}`} className="text-muted-foreground hover:text-primary">{options.email}</a>
                  </div>
                </div>
              )}
              {options.address && (
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">Endereço</h4>
                    <p className="text-muted-foreground">{options.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {options.map_embed_url && (
            <Card>
              <CardHeader>
                <CardTitle>Nossa Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={options.map_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Envie uma Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input placeholder="Seu nome" />
                <Input type="email" placeholder="Seu email" />
                <Input placeholder="Assunto" />
                <Textarea placeholder="Sua mensagem" rows={5} />
                <Button type="submit" className="w-full">Enviar Mensagem</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactTemplate;