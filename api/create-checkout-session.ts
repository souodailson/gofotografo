import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { priceId, userId, userEmail, planType, successUrl, cancelUrl } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        plan_type: planType,
        user_id: userId,
      },
      // Configurações específicas de assinatura
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_type: planType,
        },
      },
      // Permitir códigos promocionais
      allow_promotion_codes: false,
      // Configurar as informações do customer
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}