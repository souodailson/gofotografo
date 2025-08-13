-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS - GO.FOTÓGRAFO
-- =====================================================
-- Script para corrigir as constraints de foreign key
-- que estão causando erro nos lançamentos financeiros

-- =====================================================
-- 1. REMOVER CONSTRAINTS INCORRETAS
-- =====================================================

-- Remover constraint de cliente_id se existir e estiver incorreta
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_cliente_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        ALTER TABLE transacoes DROP CONSTRAINT transacoes_cliente_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_fornecedor_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        ALTER TABLE transacoes DROP CONSTRAINT transacoes_fornecedor_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_trabalho_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        ALTER TABLE transacoes DROP CONSTRAINT transacoes_trabalho_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_wallet_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        ALTER TABLE transacoes DROP CONSTRAINT transacoes_wallet_id_fkey;
    END IF;
END $$;

-- =====================================================
-- 2. LIMPEZA DE DADOS ÓRFÃOS
-- =====================================================

-- Limpar referências para clientes que não existem
UPDATE transacoes 
SET cliente_id = NULL 
WHERE cliente_id IS NOT NULL 
  AND cliente_id NOT IN (SELECT id FROM clients WHERE id IS NOT NULL);

-- Limpar referências para trabalhos que não existem
UPDATE transacoes 
SET trabalho_id = NULL 
WHERE trabalho_id IS NOT NULL 
  AND trabalho_id NOT IN (SELECT id FROM workflow_cards WHERE id IS NOT NULL);

-- Limpar referências para carteiras que não existem
UPDATE transacoes 
SET wallet_id = NULL 
WHERE wallet_id IS NOT NULL 
  AND wallet_id NOT IN (SELECT id FROM wallets WHERE id IS NOT NULL);

-- =====================================================
-- 3. GARANTIR QUE AS TABELAS REFERENCIADAS EXISTEM
-- =====================================================

-- Verificar se a tabela clients existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        CREATE TABLE clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY clients_policy ON clients
        FOR ALL USING (auth.uid() = user_id);
        
        CREATE INDEX idx_clients_user_id ON clients(user_id);
    END IF;
END $$;

-- Verificar se a tabela workflow_cards existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_cards') THEN
        CREATE TABLE workflow_cards (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'novo-lead',
            value DECIMAL(12,2) DEFAULT 0,
            client_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE workflow_cards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY workflow_cards_policy ON workflow_cards
        FOR ALL USING (auth.uid() = user_id);
        
        CREATE INDEX idx_workflow_cards_user_id ON workflow_cards(user_id);
        CREATE INDEX idx_workflow_cards_client_id ON workflow_cards(client_id);
    END IF;
END $$;

-- Verificar se a tabela wallets existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
        CREATE TABLE wallets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'banco',
            initial_balance DECIMAL(12,2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY wallets_policy ON wallets
        FOR ALL USING (auth.uid() = user_id);
        
        CREATE INDEX idx_wallets_user_id ON wallets(user_id);
    END IF;
END $$;

-- =====================================================
-- 4. RECRIAR AS CONSTRAINTS CORRETAS
-- =====================================================

-- Garantir que as foreign keys são nullable
ALTER TABLE transacoes ALTER COLUMN cliente_id DROP NOT NULL;
ALTER TABLE transacoes ALTER COLUMN trabalho_id DROP NOT NULL;
ALTER TABLE transacoes ALTER COLUMN wallet_id DROP NOT NULL;

-- Adicionar constraint para cliente_id (deve referenciar clients.id)
ALTER TABLE transacoes 
ADD CONSTRAINT transacoes_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Adicionar constraint para trabalho_id (deve referenciar workflow_cards.id)
ALTER TABLE transacoes 
ADD CONSTRAINT transacoes_trabalho_id_fkey 
FOREIGN KEY (trabalho_id) REFERENCES workflow_cards(id) ON DELETE SET NULL;

-- Adicionar constraint para wallet_id (deve referenciar wallets.id)
ALTER TABLE transacoes 
ADD CONSTRAINT transacoes_wallet_id_fkey 
FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL;

-- =====================================================
-- 5. TESTAR SE AS CONSTRAINTS ESTÃO FUNCIONANDO
-- =====================================================

-- Mostrar estrutura das constraints para verificação
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'transacoes'
ORDER BY tc.constraint_name;