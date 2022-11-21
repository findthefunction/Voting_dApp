import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyERC20Token.json';

export class CreatePaymentOrderDto {
  value: number;
  secret: string;
}

export class RequestPaymentOrderDto {
  id: number;
  secret: string;
  receiver: string;
}

export class PaymentOrders {
  value: number;
  id: number;
  secret: string;
}

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  erc20ContractFactory: ethers.ContractFactory;

  paymentOrders: PaymentOrders[];

  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    this.erc20ContractFactory = new ethers.ContractFactory(
      tokenJson.abi,
      tokenJson.bytecode,
    );
    this.paymentOrders = [];
  }

  getBlock(blockNumberOrTag = 'latest'): Promise<ethers.providers.Block> {
    return ethers.getDefaultProvider('goerli').getBlock(blockNumberOrTag);
  }

  async getTotalSupply(contractAddress: string): Promise<number> {
    const contractInstance = this.erc20ContractFactory
      .attach(contractAddress)
      .connect(this.provider);
    const totalSupply = await contractInstance.totalSupply();
    return parseFloat(ethers.utils.formatEther(totalSupply));
  }
  async getAllowance(
    contractAddress: string,
    from: string,
    to: string,
  ): Promise<number> {
    const contractInstance = this.erc20ContractFactory
      .attach(contractAddress)
      .connect(this.provider);
    const getAllowance = await contractInstance.allowance(from, to);
    return parseFloat(ethers.utils.formatEther(getAllowance));
  }

  getPaymentOrder(id: number) {
    const paymentOrder = this.paymentOrders[id];
    return { value: paymentOrder.value, id: paymentOrder.id };
  }

  createPaymentOrder(value: number, secret: string) {
    const newPaymentOrder = new PaymentOrders();
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret;
    newPaymentOrder.id = this.paymentOrders.length;
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }
  async requestPaymentOrder(id: number, secret: string, receiver: string) {
    const paymentOrder = this.paymentOrders[id];
    if (secret === paymentOrder.secret) throw new Error('Wrong secret');
    const signer = ethers.Wallet.createRandom().connect(this.provider); // this could be an address
    const contractInstance = this.erc20ContractFactory
      .attach('address in your .env file')
      .connect(signer);
    const tx = await contractInstance.mint(receiver, paymentOrder.value);
    return tx.wait();
  }
}
