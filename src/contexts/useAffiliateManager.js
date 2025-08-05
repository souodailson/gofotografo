import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useAffiliateManager = (user, settings) => {
  const handleNewSubscription = useCallback(async (planId, subscriptionId) => {
    if (!user?.id || !settings?.referred_by) {
      return;
    }

    try {
      // 1. Find the referrer by their referral code
      const { data: referrerSettings, error: referrerError } = await supabase
        .from('settings')
        .select('user_id')
        .eq('referral_code', settings.referred_by)
        .single();

      if (referrerError || !referrerSettings) {
        console.warn(`Referrer not found for code ${settings.referred_by}. Cannot create referral record.`);
        return;
      }
      const referrerId = referrerSettings.user_id;

      // 2. Create the referral record
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: user.id,
          referred_email: user.email,
          referred_name: settings.user_name,
          status: 'subscribed',
          subscription_plan: planId,
          subscription_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (referralError) throw referralError;
      
      console.log(`Referral record created: ${referral.id}`);

      // 3. Get affiliate program settings
      const { data: affiliateSettings, error: affiliateSettingsError } = await supabase
        .from('affiliate_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (affiliateSettingsError || !affiliateSettings || !affiliateSettings.is_active) {
        console.log("Affiliate program is not active or settings not found. No commission will be generated.");
        return;
      }

      // 4. Calculate commission and create the commission record
      const { data: planData, error: planError } = await supabase
        .from('plans') // Assuming you have a 'plans' table with prices
        .select('price')
        .eq('plan_id', planId)
        .single();
        
      if (planError || !planData) {
        console.warn(`Plan details for ${planId} not found. Cannot calculate commission.`);
        return;
      }

      const commissionAmount = (planData.price * affiliateSettings.commission_percentage) / 100;
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + affiliateSettings.payout_waiting_days);

      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          referral_id: referral.id,
          referrer_id: referrerId,
          amount: commissionAmount,
          status: 'pending',
          due_date: dueDate.toISOString(),
        });

      if (commissionError) throw commissionError;

      console.log(`Commission of ${commissionAmount} created for referrer ${referrerId}`);

    } catch (error) {
      console.error("Error in handleNewSubscription for affiliate program:", error.message);
    }
  }, [user, settings]);

  return { handleNewSubscription };
};