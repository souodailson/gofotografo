# 🚀 INSTRUÇÕES PARA CORRIGIR STRIPE - CSP

## ❌ **PROBLEMA IDENTIFICADO**
O Content Security Policy (CSP) estava bloqueando o carregamento do Stripe.js, impedindo que os pagamentos funcionem.

## ✅ **SOLUÇÃO APLICADA**
Atualizei o arquivo `vercel.json` para incluir os domínios do Stripe no CSP:

### Domínios Stripe adicionados:
- `https://js.stripe.com` (script-src)
- `https://api.stripe.com` (connect-src)  
- `https://checkout.stripe.com` (connect-src + form-action)

## 🔧 **PARA APLICAR A CORREÇÃO**

### 1. Fazer Deploy no Vercel
```bash
# Se usando Vercel CLI
vercel --prod

# Ou fazer commit e push para deploy automático
git add .
git commit -m "fix: adicionar domínios Stripe ao CSP"
git push origin main
```

### 2. Verificar se funcionou
1. Aguarde o deploy completar
2. Acesse `/plans` no seu site
3. Clique em "Começar Agora" ou "Garantir Oferta Especial"
4. Deve redirecionar para o checkout do Stripe

## 📋 **ALTERAÇÕES FEITAS**

### Antes:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.supabase.co https://cdn.jsdelivr.net https://cdnjs.cloudflare.com
```

### Depois:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.supabase.co https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://js.stripe.com
```

### Também adicionado:
- `form-action 'self' https://checkout.stripe.com`
- `connect-src` includes `https://api.stripe.com https://checkout.stripe.com`

## ⚠️ **IMPORTANTE**
Após o deploy, teste imediatamente:
1. Acesse `/plans`
2. Tente fazer uma compra teste
3. Verifique se redireciona corretamente para o Stripe
4. Monitore o console do navegador para outros erros

## 🔍 **SE AINDA HOUVER PROBLEMAS**
1. Verifique se o deploy foi bem-sucedido
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Teste em modo incógnito
4. Verifique se há outros CSPs sendo aplicados por CDN/proxy