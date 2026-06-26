const Razorpay = require('razorpay');
require('dotenv').config();

async function testRazorpay() {
  console.log('KEY_ID:', process.env.RAZORPAY_KEY_ID);
  console.log('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'PRESENT' : 'MISSING');

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
    });
    console.log('Order created:', order);
  } catch (error) {
    console.error('Razorpay Error:', error);
  }
}

testRazorpay();
