const midtransClient = require('midtrans-client');
const SERVER_KEY = 'SB-Mid-server-GUl55hDGDaHwCKowjTGPaRxX';

async function createSnapTransaction(amount, paymentType = 'qris') {
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: SERVER_KEY
  });
  
  // Use ALL payment methods - no restrictions to avoid "no payment channels available" error
  const parameters = {
    transaction_details: {
      order_id: 'order-' + Date.now(),
      gross_amount: amount
    }
    // No enabled_payments = ALL payment methods available
    // User can choose QRIS, VA, Credit Card, etc. from Midtrans payment page
  };
  
  console.log(`Creating Snap transaction: amount=${amount}`);
  console.log(`✅ Using ALL payment methods (no restrictions)`);
  
  const transaction = await snap.createTransaction(parameters);
  return transaction.redirect_url;
}


if (require.main === module) {
  const amount = parseInt(process.argv[2] || '10000', 10);
  createSnapTransaction(amount)
    .then((url) => {
      console.log(url);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = createSnapTransaction;
