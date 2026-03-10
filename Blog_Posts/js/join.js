// join.js - Payment form handler
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = "https://pcjunoldozpddssszoke.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9mLZyK-_kNxvfOopEnHbEg_b_1oPBNg";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const body = document.body;
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.className = savedTheme;

  const setTheme = (theme) => {
    body.className = theme;
    localStorage.setItem('theme', theme);
  };

  document.getElementById('lightBtn').onclick = () => setTheme('light');
  document.getElementById('darkBtn').onclick = () => setTheme('dark');
  document.getElementById('readingBtn').onclick = () => setTheme('reading');

  // Amount Display
  const amountInput = document.getElementById('amount');
  const displayAmount = document.getElementById('displayAmount');

  amountInput.addEventListener('input', (e) => {
    const amount = e.target.value || '0';
    displayAmount.textContent = '₹' + amount;
  });

  // Payment Form Submit
  const form = document.getElementById('paymentForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const opinion = document.getElementById('opinion').value;
    const amount = document.getElementById('amount').value;

    if (!name || !email || !amount) {
      alert('Please fill in all required fields (Name, Email, Amount)');
      return;
    }

    if (amount < 10) {
      alert('Minimum amount is ₹10');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Save payment to Supabase
    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            auth_id: null, // Guest payment (no auth user)
            amount: parseFloat(amount),
            payment_status: 'initiated',
            payment_initiated_date: new Date().toISOString()
          }
        ])
        .select();

      if (paymentError) {
        throw paymentError;
      }

      // Save user details for reference
      const userData = {
        name,
        email,
        phone: phone || 'Not provided',
        opinion: opinion || 'Not provided',
        amount,
        payment_id: paymentData[0].id,
        timestamp: new Date().toLocaleString()
      };

      localStorage.setItem('lastDonation', JSON.stringify(userData));

      // Reset form
      form.reset();
      displayAmount.textContent = '₹0';
      alert(`Thank you for your support! Payment initiated.\n\nPayment ID: ${paymentData[0].id}\n\nPlease scan the QR code to complete payment.`);
    } catch (error) {
      alert('Error saving payment: ' + (error.message || 'Unknown error'));
    }
  });
});
