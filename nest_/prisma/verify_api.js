const axios = require('axios');

async function verifyAPI() {
  try {
    const response = await axios.get('http://127.0.0.1:3001/products');
    console.log('API Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.data && response.data.data.length > 0) {
      const product = response.data.data[0];
      console.log('\n--- Sample Product Data ---');
      console.log('Name:', product.name);
      console.log('Theme:', product.theme);
      console.log('BgColor:', product.bgColor);
      console.log('Variants Count:', product.variants?.length);
      
      if (product.variants?.length > 0) {
        const variant = product.variants[0];
        console.log('\n--- Sample Variant Data ---');
        console.log('SKU:', variant.sku);
        console.log('Price:', variant.price);
        console.log('Selling Price:', variant.sellingPrice);
      }
    } else {
      console.log('❌ No products in API response!');
    }
  } catch (err) {
    console.error('❌ API Call Failed:', err.message);
  }
}

verifyAPI();
