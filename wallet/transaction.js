const ChainUtils = require('../chain-util');
class Transaction {
  constructor() {
    this.id = ChainUtils.id();
    this.input = null;
    this.outputs = [];
  }

  update(senderWallet, recipient, amount) {
    const senderOutPut = this.outputs.find(output => output.address === senderWallet.publicKey);

    if (amount > senderOutPut.amount) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    senderOutPut.amount = senderOutPut.amount - amount;
    this.outputs.push({ amount, address: recipient });
    Transaction.signTransaction(this, senderWallet);
    
    return this;
  }
  static newTransaction(senderWallet, recipient, amount) {
    const transaction = new this();

    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    transaction.outputs.push(...[
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount, address: recipient }
    ]);

    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtils.hash(transaction.outputs))
    }
  }

  static verifyTransaction(transaction) {
    return ChainUtils.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtils.hash(transaction.outputs)
    );
  }

}

module.exports = Transaction;