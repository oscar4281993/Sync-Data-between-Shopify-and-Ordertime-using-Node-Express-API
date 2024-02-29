const express = require('express');

const dataOTShopify = require('./controllers/integrate-orderTime-Shopify');

const router = express.Router();

router.post('/ordertime-webhook', dataOTShopify.getWebhookData);
router.post('/order/created/to/ot', dataOTShopify.postOrderToOT);

module.exports = router;
