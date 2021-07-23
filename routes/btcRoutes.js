const { Router } = require('express');
const router = Router();

const bitcoinController = require('../controllers/btcControl');

router.get('/create/wallet', async (req, res) => {
    try {
        const result = await bitcoinController.generateWallet();
        res.send(result);
    } catch (error) {
        console.log({ error });
        res.send(error);
    }
});

router.post('/fetch/utxos', async (req, res) => {
    try {
        const result = await bitcoinController.createTxn(req.body);
        res.send(result);
    } catch (error) {
        console.log({ error });
        res.send(error);
    }
});

module.exports = router;