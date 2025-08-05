export const walletIcons = {
    bank: [
        { name: "Nubank", url: "https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-2.png" },
        { name: "Banco do Brasil", url: "https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo-4.png" },
        { name: "Bradesco", url: "https://play-lh.googleusercontent.com/ZgYYL4k5QFHo1lCRUBFzdW5npSfx1EGUqvsB-NzsItCS1WGINGAPM0QK9Cca1q9xsOLh=w240-h480-rw" },
        { name: "Itaú", url: "https://logodownload.org/wp-content/uploads/2014/05/itau-logo-8.png" },
        { name: "Caixa Econômica", url: "https://www.caixa.gov.br/PublishingImages/Paginas/LT_T011/app_Caixa.png" },
    ],
    gateway: [
        { name: "PicPay", url: "https://play-lh.googleusercontent.com/pTvc9kCumx_24eJDwGUpvcBwljcIBkrsL3qHwhBW2NalMQ-XxTtHRV9YAJanBxkV0Rw" },
        { name: "Mercado Pago", url: "https://play-lh.googleusercontent.com/6a7KGB_J06Lwct1F2kuwK_GbNm4E8Vkl0MJqzjcddpGjCIsTMOg2nJ3WW-dGCr883FI=w240-h480-rw" },
        { name: "PagSeguro", url: "https://assets.pagseguro.com.br/registration-fe/5.10.1/_next/static/media/pag-bank-banner.3e81dc45.png" },
        { name: "SumUp", url: "https://play-lh.googleusercontent.com/QmvpebjqnqTtUuTSDEt8zBmLf87-FpVU1uvuMP2zazqyYoEHZlZUB7QZ4j_klH3igQ" },
        { name: "Stone", url: "https://images.seeklogo.com/logo-png/36/1/stone-pagamentos-logo-png_seeklogo-364485.png" },
        { name: "PayPal", url: "https://play-lh.googleusercontent.com/iQ8f5plIFy9rrY46Q2TNRwq_8nCvh9LZVwytqMBpOEcfnIU3vTkICQ6L1-RInWS93oQg" },
        { name: "Stripe", url: "https://play-lh.googleusercontent.com/2PS6w7uBztfuMys5fgodNkTwTOE6bLVB2cJYbu5GHlARAK36FzO5bUfMDP9cEJk__cE" },
        { name: "Asaas", url: "https://cdn.asaas.com/asaas-logo.svg" },
        { name: "Gerencianet", url: "https://gerencianet.com.br/wp-content/themes/gerencianet/assets/img/logo-gerencianet.svg" },
        { name: "Pagar.me", url: "https://play-lh.googleusercontent.com/_zZlN3sJsEXGEicuECbyCcEuaV9gf2ZJtqz0r5UtBd59-G93hNNiKZEgBwqiBFgflH6T=w240-h480-rw" },
        { name: "Cielo", url: "https://play-lh.googleusercontent.com/BukKjSZwbGxLLSOkuzNztYXGV2KpEecAWO7TvFdC8-cVGWv_kzJ4I_J5lKwexQlEky4" },
        { name: "Rede", url: "https://cdn6.aptoide.com/imgs/7/1/8/7184445ac1374f5a1e87a50d56c2b6db_icon.png" },
        { name: "GetNet", url: "https://play-lh.googleusercontent.com/4tGSaBYJh7I_11w3T8laid5Y62e7jgJIyOeDiJkRPH9s6HJi6XRk_Rqz4vsu1gq_Qg" },
    ],
    cash: [
        { name: "Dinheiro", url: "https://cdn-icons-png.flaticon.com/512/5451/5451648.png" }
    ]
};

export const gatewayFeeSuggestions = {
    "Mercado Pago": [
      { name: "Recebimento na hora", fee: 4.99, release_days: 0 },
      { name: "Recebimento em 14 dias", fee: 3.79, release_days: 14 },
      { name: "Recebimento em 30 dias", fee: 3.03, release_days: 30 },
    ],
    "PagSeguro": [
      { name: "Recebimento na hora", fee: 4.99, release_days: 0 },
      { name: "Recebimento em 14 dias", fee: 3.89, release_days: 14 },
      { name: "Recebimento em 30 dias", fee: 3.19, release_days: 30 },
    ],
    "PicPay": [
      { name: "Padrão", fee: 3.99, release_days: 30 },
    ],
    "PayPal": [
      { name: "Padrão", fee: 4.79, release_days: 1 },
    ],
    "SumUp": [
      { name: "Recebimento em 1 dia útil", fee: 4.60, release_days: 1 },
      { name: "Recebimento em 30 dias", fee: 3.60, release_days: 30 },
    ],
    "Stone": [
        { name: "Recebimento imediato", fee: 5.49, release_days: 0 },
        { name: "Recebimento em 30 dias", fee: 3.89, release_days: 30 },
    ],
    "Stripe": [
        { name: "Padrão", fee: 4.90, release_days: 7 },
    ],
    "Asaas": [
        { name: "Recebimento parcelado", fee: 4.00, release_days: 30 }, // Simplified for example
    ],
    "Gerencianet": [
        { name: "Padrão", fee: 3.89, release_days: 2 },
    ],
    "Pagar.me": [
        { name: "Padrão", fee: 3.79, release_days: 30 },
    ],
    "Cielo": [
        { name: "Padrão", fee: 3.29, release_days: 30 },
    ],
    "Rede": [
        { name: "Padrão", fee: 3.09, release_days: 30 },
    ],
    "GetNet": [
        { name: "Padrão", fee: 3.19, release_days: 30 },
    ],
};