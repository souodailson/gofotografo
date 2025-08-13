-- =====================================================
-- SQL PARA NOVAS FUNCIONALIDADES - GO.FOTÓGRAFO
-- Execute este script no seu Supabase para criar todas as tabelas necessárias
-- =====================================================

-- 1. SPOTS (Locais para ensaios fotográficos)
CREATE TABLE IF NOT EXISTS spots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('parque', 'igreja', 'praia', 'buffet', 'hotel', 'salao', 'sitio', 'urbano', 'historico', 'natureza')),
    region VARCHAR(50) NOT NULL,
    description TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    price_level INTEGER DEFAULT 2 CHECK (price_level >= 1 AND price_level <= 5),
    google_place_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para SPOTS
CREATE INDEX idx_spots_category ON spots(category);
CREATE INDEX idx_spots_region ON spots(region);
CREATE INDEX idx_spots_status ON spots(status);
CREATE INDEX idx_spots_created_by ON spots(created_by);

-- 2. SPOT PHOTOS
CREATE TABLE IF NOT EXISTS spot_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    description TEXT,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para SPOT PHOTOS
CREATE INDEX idx_spot_photos_spot_id ON spot_photos(spot_id);
CREATE INDEX idx_spot_photos_cover ON spot_photos(is_cover);

-- 3. SPOT RATINGS (Avaliações dos locais)
CREATE TABLE IF NOT EXISTS spot_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(spot_id, user_id)
);

-- Índices para SPOT RATINGS
CREATE INDEX idx_spot_ratings_spot_id ON spot_ratings(spot_id);
CREATE INDEX idx_spot_ratings_user_id ON spot_ratings(user_id);
CREATE INDEX idx_spot_ratings_rating ON spot_ratings(rating);

-- 4. RATING LIKES (Curtidas em avaliações)
CREATE TABLE IF NOT EXISTS rating_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES spot_ratings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rating_id, user_id)
);

-- 5. RATING REPLIES (Respostas às avaliações)
CREATE TABLE IF NOT EXISTS rating_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES spot_ratings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    reply TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. QUICK RESPONSES (Respostas rápidas)
CREATE TABLE IF NOT EXISTS quick_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('whatsapp', 'email', 'instagram', 'facebook', 'telefone', 'sms')),
    message TEXT NOT NULL,
    tags TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para QUICK RESPONSES
CREATE INDEX idx_quick_responses_category ON quick_responses(category);
CREATE INDEX idx_quick_responses_active ON quick_responses(is_active);
CREATE INDEX idx_quick_responses_created_by ON quick_responses(created_by);

-- 7. CREATIVE IDEAS (INSPIRA - Ideias criativas)
CREATE TABLE IF NOT EXISTS creative_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('casamento', 'ensaio', 'familia', 'gestante', 'newborn', 'infantil', 'formatura', 'corporativo', 'evento')),
    description TEXT,
    season VARCHAR(20) CHECK (season IN ('primavera', 'verao', 'outono', 'inverno', 'todas')),
    style VARCHAR(255),
    props TEXT,
    tips TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    popularity_score INTEGER DEFAULT 0,
    tags TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para CREATIVE IDEAS
CREATE INDEX idx_creative_ideas_category ON creative_ideas(category);
CREATE INDEX idx_creative_ideas_season ON creative_ideas(season);
CREATE INDEX idx_creative_ideas_active ON creative_ideas(is_active);
CREATE INDEX idx_creative_ideas_featured ON creative_ideas(is_featured);

-- 8. SEASONAL DATA (Dados sazonais)
CREATE TABLE IF NOT EXISTS seasonal_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    season_name VARCHAR(100) NOT NULL,
    description TEXT,
    opportunities TEXT,
    tips TEXT,
    marketing_strategies TEXT,
    average_demand INTEGER DEFAULT 3 CHECK (average_demand >= 1 AND average_demand <= 5),
    price_trend VARCHAR(20) DEFAULT 'stable' CHECK (price_trend IN ('increasing', 'stable', 'decreasing')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para SEASONAL DATA
CREATE INDEX idx_seasonal_data_month ON seasonal_data(month);
CREATE INDEX idx_seasonal_data_active ON seasonal_data(is_active);

-- 9. MARKET DATA (Dados de mercado)
CREATE TABLE IF NOT EXISTS market_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('casamento', 'ensaio', 'corporativo', 'evento', 'produto', 'gestante', 'newborn', 'familia')),
    average_price DECIMAL(10, 2) NOT NULL,
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    competition_level VARCHAR(20) DEFAULT 'medio' CHECK (competition_level IN ('baixo', 'medio', 'alto')),
    total_photographers INTEGER DEFAULT 0,
    market_growth DECIMAL(5, 2) DEFAULT 0,
    demand_level INTEGER DEFAULT 3 CHECK (demand_level >= 1 AND demand_level <= 5),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para MARKET DATA
CREATE INDEX idx_market_data_region ON market_data(region);
CREATE INDEX idx_market_data_service ON market_data(service_type);
CREATE INDEX idx_market_data_verified ON market_data(is_verified);

-- 10. COMPETITOR ANALYSIS (Análise de concorrência - RIVAL)
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    competitor_name VARCHAR(255),
    price_range VARCHAR(50),
    rating DECIMAL(3, 2),
    portfolio_quality INTEGER CHECK (portfolio_quality >= 1 AND portfolio_quality <= 5),
    social_media_presence INTEGER CHECK (social_media_presence >= 1 AND social_media_presence <= 5),
    website_url VARCHAR(500),
    instagram_followers INTEGER DEFAULT 0,
    strengths TEXT,
    weaknesses TEXT,
    market_position VARCHAR(20) CHECK (market_position IN ('premium', 'medium', 'budget')),
    is_direct_competitor BOOLEAN DEFAULT TRUE,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para COMPETITOR ANALYSIS
CREATE INDEX idx_competitor_region ON competitor_analysis(region);
CREATE INDEX idx_competitor_service ON competitor_analysis(service_type);
CREATE INDEX idx_competitor_position ON competitor_analysis(market_position);

-- 11. OPPORTUNITY ANALYSIS (Análise de oportunidades - OPPORTUNE)
CREATE TABLE IF NOT EXISTS opportunity_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    opportunity_type VARCHAR(50) CHECK (opportunity_type IN ('evento', 'temporada', 'tendencia', 'nichos', 'parceria')),
    description TEXT,
    potential_revenue DECIMAL(10, 2),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    time_sensitivity VARCHAR(20) CHECK (time_sensitivity IN ('urgente', 'medio', 'baixo')),
    investment_required DECIMAL(10, 2),
    expected_roi DECIMAL(5, 2),
    target_audience TEXT,
    action_steps TEXT,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'pursuing', 'completed', 'missed')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para OPPORTUNITY ANALYSIS
CREATE INDEX idx_opportunity_category ON opportunity_analysis(category);
CREATE INDEX idx_opportunity_type ON opportunity_analysis(opportunity_type);
CREATE INDEX idx_opportunity_status ON opportunity_analysis(status);
CREATE INDEX idx_opportunity_deadline ON opportunity_analysis(deadline);

-- 12. USER PREFERENCES (Preferências do usuário)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    preferred_region VARCHAR(100),
    primary_services TEXT[], -- Array de serviços principais
    target_audience TEXT,
    business_goals TEXT,
    marketing_budget DECIMAL(10, 2),
    experience_level VARCHAR(20) CHECK (experience_level IN ('iniciante', 'intermediario', 'avancado', 'expert')),
    notification_preferences JSONB,
    features_enabled JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SYSTEM_FEATURES (Controle de recursos do sistema)
CREATE TABLE IF NOT EXISTS system_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key VARCHAR(50) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    requires_subscription BOOLEAN DEFAULT FALSE,
    subscription_plans TEXT[], -- Planos que têm acesso
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir recursos padrão
INSERT INTO system_features (feature_key, feature_name, description, category, is_enabled) VALUES
('rival', 'RIVAL - Análise de Concorrência', 'Sistema de análise da concorrência local', 'analytics', true),
('metas', 'METAS - Simulador de Ganhos', 'Simulador de metas e plano estratégico', 'business', true),
('gomov', 'GO.MOV - Logística de Eventos', 'Calculadora de logística para eventos', 'logistics', true),
('spot', 'SPOT - Locais para Ensaios', 'Sistema de locais e avaliações', 'locations', true),
('inspira', 'INSPIRA - Central de Ideias', 'Central de ideias criativas', 'creativity', true),
('season', 'SEASON - Análise Sazonal', 'Análise de oportunidades sazonais', 'analytics', true),
('opportune', 'OPPORTUNE - Oportunidades', 'Sistema de análise de oportunidades', 'business', true),
('respostas', 'RESPOSTAS - Templates Rápidos', 'Sistema de respostas rápidas', 'communication', true)
ON CONFLICT (feature_key) DO UPDATE SET
    feature_name = EXCLUDED.feature_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 14. Funções para incrementar/decrementar likes
CREATE OR REPLACE FUNCTION increment_rating_likes(rating_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE spot_ratings 
    SET likes_count = likes_count + 1
    WHERE id = rating_id
    RETURNING likes_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_rating_likes(rating_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE spot_ratings 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = rating_id
    RETURNING likes_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 15. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spot_ratings_updated_at BEFORE UPDATE ON spot_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quick_responses_updated_at BEFORE UPDATE ON quick_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creative_ideas_updated_at BEFORE UPDATE ON creative_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonal_data_updated_at BEFORE UPDATE ON seasonal_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunity_analysis_updated_at BEFORE UPDATE ON opportunity_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_features_updated_at BEFORE UPDATE ON system_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Políticas RLS (Row Level Security)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos podem ler dados públicos)
CREATE POLICY "spots_read_policy" ON spots FOR SELECT USING (status = 'active');
CREATE POLICY "spot_photos_read_policy" ON spot_photos FOR SELECT USING (true);
CREATE POLICY "spot_ratings_read_policy" ON spot_ratings FOR SELECT USING (true);
CREATE POLICY "quick_responses_read_policy" ON quick_responses FOR SELECT USING (is_active = true);
CREATE POLICY "creative_ideas_read_policy" ON creative_ideas FOR SELECT USING (is_active = true);
CREATE POLICY "seasonal_data_read_policy" ON seasonal_data FOR SELECT USING (is_active = true);
CREATE POLICY "market_data_read_policy" ON market_data FOR SELECT USING (true);

-- Políticas de escrita (usuários autenticados)
CREATE POLICY "spots_write_policy" ON spots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "spot_ratings_write_policy" ON spot_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "rating_likes_write_policy" ON rating_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "rating_replies_write_policy" ON rating_replies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_policy" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DADOS INICIAIS PARA POPULAR AS TABELAS
-- =====================================================

-- Dados para SPOTS (alguns locais famosos do Brasil)
INSERT INTO spots (name, category, region, description, address, phone, website, price_level) VALUES
('Parque Ibirapuera', 'parque', 'zona-sul', 'Grande parque urbano com diversos cenários para ensaios', 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP', '(11) 5574-5045', 'https://parqueibirapuera.org', 1),
('Catedral da Sé', 'igreja', 'centro', 'Catedral gótica histórica no centro de São Paulo', 'Praça da Sé - Sé, São Paulo - SP', '(11) 3107-6832', 'https://catedralmetropolitana.com.br', 2),
('Praia de Copacabana', 'praia', 'zona-sul', 'Uma das praias mais famosas do mundo', 'Av. Atlântica - Copacabana, Rio de Janeiro - RJ', '', '', 1),
('Theatro Municipal', 'historico', 'centro', 'Teatro histórico com arquitetura clássica', 'Praça Ramos de Azevedo - República, São Paulo - SP', '(11) 3053-2090', 'https://theatromunicipal.org.br', 3),
('Jardim Botânico', 'natureza', 'zona-sul', 'Jardim com grande diversidade de plantas', 'Rua Jardim Botânico, 1008 - Jardim Botânico, Rio de Janeiro - RJ', '(21) 3874-1808', 'https://jbrj.gov.br', 2)
ON CONFLICT DO NOTHING;

-- Dados para QUICK_RESPONSES
INSERT INTO quick_responses (title, category, message, tags, created_by) VALUES
('Primeiro contato WhatsApp', 'whatsapp', 'Olá! Obrigado(a) pelo interesse em nossos serviços de fotografia. Ficarei feliz em criar um orçamento personalizado para você! 📸✨', 'contato,whatsapp,primeira,resposta', NULL),
('Resposta sobre valores', 'whatsapp', 'Nossos valores variam conforme o tipo de evento e pacote escolhido. Vou preparar uma proposta personalizada considerando suas necessidades específicas. Quando podemos conversar?', 'valores,precos,orcamento', NULL),
('Agradecimento pós-evento', 'email', 'Foi um prazer imenso registrar momentos tão especiais! Suas fotos estão sendo editadas com todo carinho e estarão prontas em até 15 dias úteis. Muito obrigado pela confiança!', 'agradecimento,pos-evento,entrega', NULL),
('Disponibilidade de data', 'whatsapp', 'Vou verificar minha agenda para a data que você mencionou. Normalmente respondo em até 2 horas. Enquanto isso, pode me contar mais sobre o que está planejando? 😊', 'agenda,disponibilidade,data', NULL),
('Follow up Instagram', 'instagram', 'Oi! Vi que você curtiu algumas fotos aqui no meu perfil. Que tal batermos um papo sobre seu próximo ensaio? Tenho algumas ideias incríveis para compartilhar! 💡📷', 'instagram,follow-up,ensaio', NULL)
ON CONFLICT DO NOTHING;

-- Dados para CREATIVE_IDEAS
INSERT INTO creative_ideas (title, category, description, season, style, props, tips, difficulty_level, tags) VALUES
('Ensaio Golden Hour no Campo', 'ensaio', 'Aproveite a luz dourada do final da tarde para criar imagens românticas em meio à natureza', 'todas', 'Romântico, Natural', 'Vestido fluido, flores silvestres, manta vintage', 'Chegue 1 hora antes do pôr do sol. Use refletor para suavizar sombras.', 2, 'golden hour,campo,romantico'),
('Newborn Lifestyle em Casa', 'newborn', 'Sessão natural e espontânea no ambiente familiar do bebê', 'todas', 'Lifestyle, Documental', 'Fraldas, naninha, brinquedos macios', 'Mantenha o ambiente aquecido. Trabalhe com luz natural das janelas.', 3, 'newborn,casa,lifestyle'),
('Casamento Rústico-Chic', 'casamento', 'Cerimônia ao ar livre com elementos rústicos e toques elegantes', 'primavera', 'Rústico, Elegante', 'Madeira, flores do campo, velas, tecidos naturais', 'Use lentes com boa abertura para trabalhar com luz natural. Foque nos detalhes.', 4, 'casamento,rustico,ar livre'),
('Ensaio Família no Parque', 'familia', 'Sessão descontraída em ambiente natural com crianças', 'outono', 'Natural, Espontâneo', 'Piquenique, bola, brinquedos, lençol colorido', 'Deixe as crianças brincarem naturalmente. Capture momentos espontâneos.', 2, 'familia,parque,criancas'),
('Gestante ao Amanhecer', 'gestante', 'Aproveite a luz suave do amanhecer para destacar a barriguinha', 'verao', 'Suave, Intimista', 'Tecidos leves, flores, ultrassom do bebê', 'Chegue cedo. Use luz natural e reflectores. Mantenha a gestante confortável.', 3, 'gestante,amanhecer,intimista')
ON CONFLICT DO NOTHING;

-- Dados para SEASONAL_DATA
INSERT INTO seasonal_data (month, season_name, description, opportunities, tips, marketing_strategies, average_demand) VALUES
(1, 'Janeiro - Verão e Renovação', 'Início do ano com energia de recomeço', 'Ensaios de verão, campanhas de ano novo, batizados', 'Aproveite a disponibilidade pós-festas. Ofereça promoções de recomeço.', 'Campanha "Novo Ano, Novas Memórias". Promoção para ensaios familiares.', 3),
(2, 'Fevereiro - Carnaval e Amor', 'Mês do Carnaval e proximidade do Dia dos Namorados', 'Carnaval, pré-wedding, ensaios de casal', 'Foque em casais e eventos temáticos. Cores vibrantes são tendência.', 'Promoção para casais. Parcerias com blocos de carnaval.', 4),
(3, 'Março - Outono e Escola', 'Início do outono, volta às aulas', 'Ensaios escolares, família, outono', 'Cores quentes do outono são perfeitas. Demanda escolar alta.', 'Parcerias com escolas. Promoção família + formatura.', 3),
(4, 'Abril - Páscoa e Chocolate', 'Páscoa e campanhas de chocolate', 'Páscoa, ensaios familiares, campanhas publicitárias', 'Tons pastéis são tendência. Foco em crianças e família.', 'Parceria com chocolaterias. Ensaios temáticos pascais.', 3),
(5, 'Maio - Dia das Mães', 'Principal data comemorativa do mês', 'Dia das Mães, ensaios multigeracionais, retratos', 'Maior demanda do semestre. Comece vendas em março.', 'Campanha massiva para Dia das Mães. Promoção 3 gerações.', 5),
(6, 'Junho - Festa Junina e Inverno', 'Festas juninas e início do inverno', 'Festas juninas, casamentos temáticos, ensaios de inverno', 'Cenários rústicos são populares. Roupas de frio criam charme.', 'Parcerias com buffets juninos. Ensaios temáticos.', 4),
(7, 'Julho - Férias de Inverno', 'Férias escolares e dia dos pais próximo', 'Viagens familiares, ensaios de férias, turismo', 'Famílias viajam mais. Ofereça serviços em destinos turísticos.', 'Parceria com hotéis e pousadas. Ensaios de viagem.', 3),
(8, 'Agosto - Dia dos Pais', 'Dia dos Pais e preparação para primavera', 'Dia dos Pais, retratos masculinos, corporativo', 'Foque em retratos masculinos e corporativos.', 'Campanha para Dia dos Pais. Parceria com empresas.', 4),
(9, 'Setembro - Primavera e Crianças', 'Início da primavera e Dia das Crianças próximo', 'Ensaios de primavera, preparação Dia das Crianças', 'Flores e cores vibrantes voltam. Planeje outubro.', 'Pré-venda Dia das Crianças. Ensaios florais.', 3),
(10, 'Outubro - Dia das Crianças', 'Principal data para fotografia infantil', 'Dia das Crianças, aniversários, ensaios temáticos', 'Maior demanda infantil do ano. Comece vendas em agosto.', 'Campanha massiva infantil. Parcerias com buffets.', 5),
(11, 'Novembro - Black Friday e Formatura', 'Black Friday e temporada de formaturas', 'Formaturas, Black Friday, pré-réveillon', 'Aproveite Black Friday para vendas futuras. Foque formaturas.', 'Promoções Black Friday. Parcerias com universidades.', 4),
(12, 'Dezembro - Natal e Confraternizações', 'Natal, réveillon e confraternizações', 'Natal, réveillon, confraternizações, retrospectivas', 'Maior demanda corporativa e familiar do ano.', 'Campanha natalina. Confraternizações empresariais.', 5)
ON CONFLICT DO NOTHING;

-- Dados para MARKET_DATA (exemplo São Paulo)
INSERT INTO market_data (region, service_type, average_price, min_price, max_price, competition_level, total_photographers, market_growth, demand_level) VALUES
('São Paulo - Capital', 'casamento', 3200.00, 1200.00, 15000.00, 'alto', 450, 8.5, 4),
('São Paulo - Capital', 'ensaio', 800.00, 200.00, 3000.00, 'alto', 380, 12.3, 5),
('São Paulo - Capital', 'corporativo', 1500.00, 500.00, 5000.00, 'medio', 120, 15.2, 3),
('São Paulo - Capital', 'gestante', 650.00, 250.00, 1800.00, 'medio', 200, 18.7, 4),
('São Paulo - Capital', 'newborn', 750.00, 300.00, 2200.00, 'alto', 180, 22.1, 5),
('Rio de Janeiro - Capital', 'casamento', 2800.00, 1000.00, 12000.00, 'alto', 320, 6.8, 4),
('Rio de Janeiro - Capital', 'ensaio', 700.00, 180.00, 2500.00, 'alto', 290, 10.5, 4),
('ABC Paulista', 'casamento', 2200.00, 800.00, 8000.00, 'medio', 85, 12.3, 3),
('Interior SP', 'casamento', 1800.00, 600.00, 6000.00, 'baixo', 180, 15.8, 3)
ON CONFLICT DO NOTHING;

-- Configurar storage bucket para imagens
-- (Execute manualmente no Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('spot-images', 'spot-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('creative-ideas-images', 'creative-ideas-images', true);

COMMENT ON TABLE spots IS 'Locais para ensaios fotográficos com avaliações da comunidade';
COMMENT ON TABLE spot_ratings IS 'Sistema de avaliações e comentários dos locais';
COMMENT ON TABLE quick_responses IS 'Templates de respostas rápidas para WhatsApp, Email, etc.';
COMMENT ON TABLE creative_ideas IS 'Central de ideias criativas para ensaios fotográficos';
COMMENT ON TABLE seasonal_data IS 'Dados e oportunidades por época do ano';
COMMENT ON TABLE market_data IS 'Dados de mercado por região e tipo de serviço';
COMMENT ON TABLE system_features IS 'Controle de recursos/funcionalidades do sistema';

-- =====================================================
-- FIM DO SCRIPT SQL
-- =====================================================