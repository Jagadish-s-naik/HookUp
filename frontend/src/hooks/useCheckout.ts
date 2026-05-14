import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { loadRazorpayScript, openRazorpayCheckout, type RazorpayResponse, type RazorpayOptions } from '../lib/razorpay';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const startCheckout = async (plan: string, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please login to continue');
      }

      // Load Razorpay Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Call Supabase Edge Function to create subscription
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: plan.toLowerCase(),
            billing_cycle: billingCycle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      // Open Razorpay Checkout
      return new Promise((resolve, reject) => {
        const options: RazorpayOptions = {
          key: data.razorpay_key_id,
          subscription_id: data.subscription_id,
          name: 'HookAI',
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
          image: '/logo.png',
          prefill: data.prefill,
          theme: {
            color: '#7C3AED',
          },
          handler: async (response: RazorpayResponse) => {
            // Usually we'd verify the payment on the backend here
            // But for now, we'll assume the Edge Function/Webhook handles the DB update
            toast.success("Payment successful!");
            navigate('/payment/success');
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              reject(new Error('Payment cancelled'));
            },
          },
        };

        openRazorpayCheckout(options);
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startCheckout,
    isLoading,
  };
}
