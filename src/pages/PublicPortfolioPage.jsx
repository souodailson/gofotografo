import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Phone, MapPin, Globe, Instagram, Camera, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FullScreenLoader from '@/components/FullScreenLoader';

const PublicPortfolioPage = () => {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        // Buscar dados do usuário e configurações
        const { data: userData, error: userError } = await supabase
          .from('users_settings')
          .select(`
            *,
            users (
              id,
              email,
              created_at
            )
          `)
          .eq('user_id', userId)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }

        if (userData) {
          setUserProfile(userData);
        } else {
          // Se não encontrou settings, buscar dados básicos do usuário
          const { data: basicUser, error: basicError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (basicError) throw basicError;
          
          setUserProfile({
            users: basicUser,
            user_name: basicUser.email,
            contact_email: basicUser.email
          });
        }

        // Buscar projetos/trabalhos do usuário (se houver uma tabela de portfólio)
        // Por enquanto, vamos deixar vazio
        setProjects([]);

      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Portfólio não encontrado</h2>
          <p className="text-muted-foreground">
            Este portfólio não existe ou não está disponível publicamente.
          </p>
        </div>
      </div>
    );
  }

  const displayName = userProfile.user_name || userProfile.users?.email || 'Fotógrafo';
  const businessName = userProfile.business_name || displayName;
  const description = userProfile.business_description || 'Fotógrafo profissional';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Logo/Avatar */}
            <div className="flex-shrink-0">
              {userProfile.logo || userProfile.profile_photo ? (
                <img 
                  src={userProfile.logo || userProfile.profile_photo} 
                  alt={businessName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">{businessName}</h1>
              <p className="text-lg text-muted-foreground mb-4">{description}</p>
              
              {/* Contact Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                {userProfile.contact_email && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{userProfile.contact_email}</span>
                  </div>
                )}
                {userProfile.contact_phone && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{userProfile.contact_phone}</span>
                  </div>
                )}
                {userProfile.address && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Sessão
              </Button>
              {userProfile.website && (
                <Button variant="outline" size="lg" asChild>
                  <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services/Specialties */}
        {userProfile.services && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Serviços</h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.services.split(',').map((service, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {service.trim()}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Portfólio</h2>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Portfólio em construção
              </h3>
              <p className="text-muted-foreground">
                Em breve você verá os trabalhos incríveis de {displayName} aqui!
              </p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="bg-card rounded-lg p-8 border">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Vamos trabalhar juntos?</h2>
            <p className="text-muted-foreground mb-6">
              Entre em contato para agendar sua sessão de fotos ou tirar suas dúvidas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Agora
              </Button>
              {userProfile.contact_email && (
                <Button variant="outline" size="lg" asChild>
                  <a href={`mailto:${userProfile.contact_email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </a>
                </Button>
              )}
              {userProfile.contact_phone && (
                <Button variant="outline" size="lg" asChild>
                  <a href={`https://wa.me/${userProfile.contact_phone.replace(/\D/g, '')}`} 
                     target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 mt-16 py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href="https://gofotografo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              GO.FOTÓGRAFO
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolioPage;