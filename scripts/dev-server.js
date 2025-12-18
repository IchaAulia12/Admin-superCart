// Simple Express server for Midtrans Snap integration (development only)
const express = require('express');
const cors = require('cors');
const createSnapTransaction = require('./midtrans-snap');

const app = express();
app.use(cors());

app.get('/snap', async (req, res) => {
  const amount = parseInt(req.query.amount, 10) || 10000;
  const paymentType = req.query.type || 'qris'; // 'qris' or 'va'
  try {
    const url = await createSnapTransaction(amount, paymentType);
    res.json({ snap_url: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
// Bind to all interfaces (0.0.0.0) so it's accessible from network devices
app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Try to find local IP address
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`Dev server listening on http://localhost:${PORT}`);
  console.log(`Also accessible at http://${localIP}:${PORT}`);
  console.log(`Use this IP in your app: ${localIP}`);
});
