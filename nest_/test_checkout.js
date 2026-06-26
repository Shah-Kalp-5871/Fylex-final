const axios = require('axios');

async function testCheckout() {
  const API_URL = 'http://127.0.0.1:3001';
  const customerId = '1';

  try {
    console.log('1. Creating address...');
    const addrResp = await axios.post(`${API_URL}/customers/${customerId}/addresses`, {
      name: 'Test User',
      mobile: '9876543210',
      address: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      type: 'home',
      isDefault: true
    });
    const addressId = addrResp.data.id.toString();
    console.log('Address Created:', addressId);

    console.log('2. Placing order...');
    const orderResp = await axios.post(`${API_URL}/orders`, {
      customerId: customerId,
      shippingAddressId: addressId,
      billingAddressId: addressId,
      paymentMethod: 'cod',
      notes: 'Test Order'
    });
    console.log('Order Created Successfully:', JSON.stringify(orderResp.data, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (error) {
    console.error('Checkout failed:', error.response ? error.response.data : error.message);
  }
}

testCheckout();
