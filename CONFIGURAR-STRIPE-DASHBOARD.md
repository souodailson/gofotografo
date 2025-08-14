# 🚨 CONFIGURAÇÃO OBRIGATÓRIA NO STRIPE DASHBOARD

## ❌ **PROBLEMAS IDENTIFICADOS:**

1. **Permissions Policy** bloqueando pagamentos ✅ **CORRIGIDO**
2. **Domínio não autorizado** no Stripe Dashboard ⚠️ **PRECISA CONFIGURAR**

## 🔧 **CONFIGURAÇÃO OBRIGATÓRIA NO STRIPE:**

### 1. Acessar o Stripe Dashboard
1. Faça login em https://dashboard.stripe.com
2. Certifique-se de estar no **ambiente LIVE** (não test)

### 2. Configurar Domínios Autorizados
1. Vá para **Settings** → **Checkout settings**
2. Ou acesse diretamente: https://dashboard.stripe.com/account/checkout/settings
3. Na seção **Domains**, adicione:
   - `https://www.gofotografo.com.br`
   - `https://gofotografo.com.br` (sem www)
   - `http://localhost:3000` (para desenvolvimento)

### 3. Configurar URLs de Retorno
Na mesma página, configure:

**Success URL:** `https://www.gofotografo.com.br/plans?status=success&session_id={CHECKOUT_SESSION_ID}`

**Cancel URL:** `https://www.gofotografo.com.br/plans?status=cancelled`

### 4. Verificar Produtos/Preços
1. Vá para **Products** no dashboard
2. Confirme que os preços existem:
   - `price_1RvmtzDORq3T75OLRhl7tGjp` (Mensal)
   - `price_1RvmtzDORq3T75OLVIfIicv5` (Anual)

### 5. Configurar Webhooks (Importante!)
1. Vá para **Developers** → **Webhooks**
2. Clique **+ Add endpoint**
3. URL: `https://SUAURL.supabase.co/functions/v1/stripe-webhook`
4. Eventos para selecionar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🚀 **APÓS CONFIGURAR:**

### 1. Deploy as alterações do Permissions Policy:
```bash
git add .
git commit -m "fix: permitir pagamentos no Permissions Policy"
git push origin main
```

### 2. Teste o sistema:
1. Aguarde o deploy
2. Acesse `/plans`
3. Clique em qualquer plano
4. Deve redirecionar para o Stripe

## ⚠️ **ATENÇÃO:**

- **SEM configurar o domínio no Stripe**, os pagamentos NUNCA funcionarão
- Use exatamente `https://www.gofotografo.com.br` (com HTTPS e www)
- Certifique-se de estar no ambiente **LIVE** do Stripe
- Os preços devem existir e estar ativos

## 🔍 **VERIFICAR SE FUNCIONOU:**

1. Console do navegador sem erros
2. Redirecionamento para `checkout.stripe.com`
3. Página de pagamento do Stripe carrega
4. Após pagamento, retorna para seu site

## 📞 **SE AINDA HOUVER PROBLEMAS:**

Verifique:
1. ✅ Domínio adicionado no Stripe
2. ✅ Permissions Policy corrigido
3. ✅ Produtos existem no Stripe
4. ✅ Webhook configurado
5. ✅ Deploy feito