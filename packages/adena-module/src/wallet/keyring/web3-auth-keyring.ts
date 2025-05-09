import { Provider, TransactionEndpoint, Tx, Wallet as Tm2Wallet } from '@gnolang/tm2-js-client';
import { v4 as uuidv4 } from 'uuid';

import { Document, makeSignedTx, useTm2Wallet } from './../..';
import { hexToArray } from './../../utils/data';
import { Keyring, KeyringData, KeyringType } from './keyring';

export class Web3AuthKeyring implements Keyring {
  public readonly id: string;
  public readonly type: KeyringType = 'WEB3_AUTH';
  public readonly publicKey: Uint8Array;
  public readonly privateKey: Uint8Array;

  constructor({ id, publicKey, privateKey }: KeyringData) {
    if (!publicKey || !privateKey) {
      throw new Error('Invalid parameter values');
    }
    this.id = id || uuidv4();
    this.publicKey = Uint8Array.from(publicKey);
    this.privateKey = Uint8Array.from(privateKey);
  }

  toData() {
    return {
      id: this.id,
      type: this.type,
      publicKey: Array.from(this.publicKey),
      privateKey: Array.from(this.privateKey),
    };
  }

  async sign(provider: Provider, document: Document) {
    const wallet = await useTm2Wallet(document).fromPrivateKey(this.privateKey);
    wallet.connect(provider);
    return this.signByWallet(wallet, document);
  }

  private async signByWallet(wallet: Tm2Wallet, document: Document) {
    const signedTx = await makeSignedTx(wallet, document);
    return {
      signed: signedTx,
      signature: signedTx.signatures,
    };
  }

  async broadcastTxSync(provider: Provider, signedTx: Tx) {
    const wallet = await Tm2Wallet.fromPrivateKey(this.privateKey);
    wallet.connect(provider);
    return wallet.sendTransaction(signedTx, TransactionEndpoint.BROADCAST_TX_SYNC);
  }

  async broadcastTxCommit(provider: Provider, signedTx: Tx) {
    const wallet = await Tm2Wallet.fromPrivateKey(this.privateKey);
    wallet.connect(provider);
    return wallet.sendTransaction(signedTx, TransactionEndpoint.BROADCAST_TX_COMMIT);
  }

  public static async fromPrivateKey(privateKey: Uint8Array) {
    const tm2Wallet = await Tm2Wallet.fromPrivateKey(privateKey);
    const publicKey = await tm2Wallet.getSigner().getPublicKey();
    return new Web3AuthKeyring({
      publicKey: Array.from(publicKey),
      privateKey: Array.from(privateKey),
    });
  }

  public static async fromPrivateKeyStr(privateKeyStr: string) {
    const privateKey = hexToArray(privateKeyStr);
    const tm2Wallet = await Tm2Wallet.fromPrivateKey(privateKey);
    const publicKey = await tm2Wallet.getSigner().getPublicKey();
    return new Web3AuthKeyring({
      publicKey: Array.from(publicKey),
      privateKey: Array.from(privateKey),
    });
  }
}
