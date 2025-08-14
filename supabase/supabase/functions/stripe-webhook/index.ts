import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import Stripe from "npm:stripe@^15.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get("stripe-signature")
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!
    const supabaseUrl = Deno.env.get("SB_URL")!
    const serviceKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!

    const supabase = createClient(supabaseUrl, serviceKey)
    const rawBody = await req.text()

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature!,
        webhookSecret
      )
    } catch (err) {
      console.error("Assinatura inválida:", err)
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }

    const upsertUserSettingsByUserId = async (userId: string, patch: Record<string, unknown>) => {
      await supabase
        .from("user_settings")
        .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true })
      const { error } = await supabase
        .from("user_settings")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
      if (error) throw error
    }

    const updateBySubscription = async (subscriptionId: string, patch: Record<string, unknown>) => {
      const { error } = await supabase
        .from("user_settings")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscriptionId)
      if (error) throw error
    }

    console.log("Evento Stripe:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId =
          (session.metadata && (session.metadata["user_id"] as string)) ||
          (session.client_reference_id as string)

        if (!userId) {
          console.warn("checkout.session.completed sem user_id (metadata.user_id ou client_reference_id)")
          break
        }

        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        await upsertUserSettingsByUserId(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_plan_id: "PROFESSIONAL",
          plan_status: "ACTIVE",
          plan_expires_at: null,
        })

        console.log("Assinatura ativada para user_id:", userId)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await updateBySubscription(sub.id, {
          plan_status: (sub.status || "active").toUpperCase(),
        })
        console.log("Subscription status:", sub.status, "id:", sub.id)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await updateBySubscription(sub.id, {
          current_plan_id: "FREE",
          plan_status: "FREE",
          stripe_subscription_id: null,
        })
        console.log("Subscription cancelada:", sub.id)
        break
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        console.log("invoice event:", event.type)
        break

      default:
        console.log("Evento não tratado:", event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err: any) {
    console.error("Erro no webhook:", err)
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})
