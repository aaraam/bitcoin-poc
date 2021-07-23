const axios = require("axios");
const bitcore = require('bitcore-lib');
const transaction = new bitcore.Transaction();

const sochain_network = "BTCTEST";

exports.generateWallet = async () => {
    try {
        const privKeyWIF = await bitcore.PrivateKey('testnet').toWIF();
        const privateKey = await bitcore.PrivateKey.fromWIF(privKeyWIF);
        const address = await privateKey.toAddress();
        console.log(`address: ${address}`);
        console.log(`privateKey: ${privateKey}`);
        return { address: address.toString() };
    } catch (error) {
        console.log({ error });
        return error
    }
}

exports.createTxn = async ({ senderAddress, senderPrivateKey, receiverAddress, amountToSend }) => {
    try {
        const result = await sendBitcoin({
            senderAddress,
            senderPrivateKey,
            receiverAddress,
            amountToSend
        });
        return result;
    } catch (error) {
        console.log({ error });
        return error
    }
}

const sendBitcoin = async ({ senderAddress, senderPrivateKey, receiverAddress, amountToSend }) => {
    let satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;

    const utxos = await axios.get(
        `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${senderAddress}`
    );

    let totalAmountAvailable = 0;
    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
        let utxo = {};

        utxo.satoshis = Math.floor(Number(element.value) * 100000000);
        utxo.script = element.script_hex;
        utxo.address = utxos.data.data.address;
        utxo.txId = element.txid;
        utxo.outputIndex = element.output_no;

        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });

    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;

    fee = transactionSize * 20
    if (totalAmountAvailable - satoshiToSend - fee  < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    transaction.from(inputs);
    transaction.to(receiverAddress, satoshiToSend);
    transaction.change(senderAddress);
    transaction.fee(fee * 20);
    transaction.sign(senderPrivateKey);

    const serializedTransaction = transaction.serialize();
    const result = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
        data: {
          tx_hex: serializedTransaction,
        },
    });
    return result.data.data;
};