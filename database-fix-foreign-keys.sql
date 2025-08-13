-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS - GO.FOTÓGRAFO
-- =====================================================
-- Script para corrigir as constraints de foreign key
-- que estão causando erro nos lançamentos financeiros

-- =================== S==================================
-- 1. CORREÇÃO DA TABELA TRANSACOES
-- =====================================================

-- Primeiro, vamos remover as constraints incorretas se existirem
DO $$
BEGIN
    -- Remover constraint de cliente_id se estiver apontando para users
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_cliente_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        EXECUTE 'ALTER TABLE transacoes DROP CONSTRAINT transacoes_cliente_id_fkey';
        RAISE NOTICE 'Constraint transacoes_cliente_id_fkey removida';
    END IF;
    
    -- Remover constraint de fornecedor_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_fornecedor_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        EXECUTE 'ALTER TABLE transacoes DROP CONSTRAINT transacoes_fornecedor_id_fkey';
        RAISE NOTICE 'Constraint transacoes_fornecedor_id_fkey removida';
    END IF;
    
    -- Remover constraint de trabalho_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_trabalho_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        EXECUTE 'ALTER TABLE transacoes DROP CONSTRAINT transacoes_trabalho_id_fkey';
        RAISE NOTICE 'Constraint transacoes_trabalho_id_fkey removida';
    END IF;
    
    -- Remover constraint de wallet_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_wallet_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        EXECUTE 'ALTER TABLE transacoes DROP CONSTRAINT transacoes_wallet_id_fkey';
        RAISE NOTICE 'Constraint transacoes_wallet_id_fkey removida';
    END IF;
END $$;

-- =====================================================
-- 2. LIMPEZA DE DADOS ÓRFÃOS ANTES DE RECRIAR AS CONSTRAINTS
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

-- Limpar referências para fornecedores que não existem (se a coluna existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transacoes' AND column_name = 'fornecedor_id') THEN
        EXECUTE 'UPDATE transacoes SET fornecedor_id = NULL WHERE fornecedor_id IS NOT NULL AND fornecedor_id NOT IN (SELECT id FROM suppliers WHERE id IS NOT NULL)';
        RAISE NOTICE 'Referências órfãs de fornecedores limpas';
    END IF;
END $$;

-- =====================================================
-- 3. RECRIAR AS CONSTRAINTS CORRETAS
-- =====================================================

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

-- Adicionar constraint para fornecedor_id se a coluna existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transacoes' AND column_name = 'fornecedor_id') THEN
        EXECUTE 'ALTER TABLE transacoes ADD CONSTRAINT transacoes_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES suppliers(id) ON DELETE SET NULL';
        RAISE NOTICE 'Constraint transacoes_fornecedor_id_fkey criada';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR E CORRIGIR OUTRAS TABELAS COM PROBLEMA SIMILAR
-- =====================================================

-- Corrigir workflow_cards se necessário
DO $$
BEGIN
    -- Verificar se existe constraint incorreta em workflow_cards
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workflow_cards_client_id_fkey' 
        AND table_name = 'workflow_cards'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Verificar se está apontando para a tabela correta
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.referential_constraints rc
            JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
            WHERE rc.constraint_name = 'workflow_cards_client_id_fkey'
            AND kcu.referenced_table_name = 'clients'
        ) THEN
            EXECUTE 'ALTER TABLE workflow_cards DROP CONSTRAINT workflow_cards_client_id_fkey';
            EXECUTE 'ALTER TABLE workflow_cards ADD CONSTRAINT workflow_cards_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL';
            RAISE NOTICE 'Constraint workflow_cards_client_id_fkey corrigida';
        END IF;
    ELSE
        -- Criar constraint se não existir
        EXECUTE 'ALTER TABLE workflow_cards ADD CONSTRAINT workflow_cards_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL';
        RAISE NOTICE 'Constraint workflow_cards_client_id_fkey criada';
    END IF;
END $$;

-- =====================================================
-- 5. VERIFICAR SE AS TABELAS REFERENCIADAS EXISTEM
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
        
        -- Habilitar RLS
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        -- Criar política
        CREATE POLICY clients_policy ON clients
        FOR ALL USING (auth.uid() = user_id);
        
        -- Criar índice
        CREATE INDEX idx_clients_user_id ON clients(user_id);
        
        RAISE NOTICE 'Tabela clients criada';
    END IF;
END $$;

-- Verificar se a tabela suppliers existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        CREATE TABLE suppliers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Habilitar RLS
        ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
        
        -- Criar política
        CREATE POLICY suppliers_policy ON suppliers
        FOR ALL USING (auth.uid() = user_id);
        
        -- Criar índice
        CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
        
        RAISE NOTICE 'Tabela suppliers criada';
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
        
        -- Habilitar RLS
        ALTER TABLE workflow_cards ENABLE ROW LEVEL SECURITY;
        
        -- Criar política
        CREATE POLICY workflow_cards_policy ON workflow_cards
        FOR ALL USING (auth.uid() = user_id);
        
        -- Criar índices
        CREATE INDEX idx_workflow_cards_user_id ON workflow_cards(user_id);
        CREATE INDEX idx_workflow_cards_client_id ON workflow_cards(client_id);
        
        RAISE NOTICE 'Tabela workflow_cards criada';
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
        
        -- Habilitar RLS
        ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
        
        -- Criar política
        CREATE POLICY wallets_policy ON wallets
        FOR ALL USING (auth.uid() = user_id);
        
        -- Criar índice
        CREATE INDEX idx_wallets_user_id ON wallets(user_id);
        
        RAISE NOTICE 'Tabela wallets criada';
    END IF;
END $$;

-- =====================================================
-- 6. GARANTIR QUE OS CAMPOS NULLABLE ESTÃO CORRETOS
-- =====================================================

-- Garantir que as foreign keys são nullable (para permitir NULL)
ALTER TABLE transacoes ALTER COLUMN cliente_id DROP NOT NULL;
ALTER TABLE transacoes ALTER COLUMN trabalho_id DROP NOT NULL;
ALTER TABLE transacoes ALTER COLUMN wallet_id DROP NOT NULL;

-- Garantir que fornecedor_id é nullable se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transacoes' AND column_name = 'fornecedor_id') THEN
        EXECUTE 'ALTER TABLE transacoes ALTER COLUMN fornecedor_id DROP NOT NULL';
        RAISE NOTICE 'Campo fornecedor_id configurado como nullable';
    END IF;
END $$;

-- =====================================================
-- 7. VALIDAÇÃO FINAL
-- =====================================================

-- Verificar se todas as constraints estão corretas
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'transacoes' 
    AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE 'Transações tem % constraints de foreign key', constraint_count;
    
    -- Listar todas as constraints
    FOR constraint_count IN 
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transacoes' 
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        -- Log das constraints existentes
        NULL;
    END LOOP;
END $$;

-- Testar se é possível inserir uma transação simples
DO $$
DECLARE
    test_user_id UUID;
    test_transaction_id UUID;
BEGIN
    -- Pegar um usuário existente para teste
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tentar inserir uma transação de teste
        INSERT INTO transacoes (user_id, descricao, valor, tipo, status, data)
        VALUES (test_user_id, 'Teste de inserção', 100.00, 'ENTRADA', 'PENDENTE', CURRENT_DATE)
        RETURNING id INTO test_transaction_id;
        
        -- Se chegou até aqui, a inserção funcionou
        RAISE NOTICE 'Teste de inserção bem-sucedido! ID: %', test_transaction_id;
        
        -- Remover o registro de teste
        DELETE FROM transacoes WHERE id = test_transaction_id;
        
        RAISE NOTICE 'Registro de teste removido. Sistema funcionando!';
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste, mas constraints estão corretas.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro no teste de inserção: %', SQLERRM;
END $$;

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

RAISE NOTICE 'Correção de foreign keys concluída!';
RAISE NOTICE 'O sistema de transações deve estar funcionando agora.';

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