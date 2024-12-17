import { Injectable } from '@nestjs/common';

import {
  Currency,
  TradeType,
  CurrencyAmount,
  Token,
  Percent,
  WBNB,
} from '@pancakeswap/sdk';
import { PoolType, SmartRouter, V2Pool } from '@pancakeswap/smart-router';
import { ChainId } from '@pancakeswap/chains';
import { ethers } from 'ethers';
// import { SwapRouter } from '@pancakeswap/smart-router';
import { V4Router } from '@pancakeswap/smart-router';
import RouterABI from '../abi.json';
import { gql, GraphQLClient } from 'graphql-request';
//import { SwapRouter } from '@pancakeswap/universal-router-sdk';
import { FeeAmount, TICK_SPACINGS } from './constants';
import { BigintIsh, sqrt } from '@pancakeswap/swap-sdk-core';
export function encodeSqrtRatioX96(
  amount1: BigintIsh,
  amount0: BigintIsh,
): bigint {
  const numerator = BigInt(amount1) << 192n;
  const denominator = BigInt(amount0);
  const ratioX192 = numerator / denominator;
  return sqrt(ratioX192);
}
import { AbiCoder } from 'ethers';
import {
  Pool,
  Position,
  NonfungiblePositionManager,
  SwapRouter,
  nearestUsableTick,
  TickMath,
  Trade,
  Route,
} from '@pancakeswap/v3-sdk';

const feeAmount = FeeAmount.MEDIUM;
const sqrtRatioX96 = encodeSqrtRatioX96(1, 1);
const liquidity = 1_000_000;

const makePool = (token0: Token, token1: Token) => {
  return new Pool(
    token0,
    token1,
    feeAmount,
    sqrtRatioX96,
    liquidity,
    TickMath.getTickAtSqrtRatio(sqrtRatioX96),
    [
      {
        index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: liquidity,
        liquidityGross: liquidity,
      },
      {
        index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: -liquidity,
        liquidityGross: liquidity,
      },
    ],
  );
};
@Injectable()
export class AppService {
  PANCAKE_V3_SWAP_ROUTER_ADDRESS: string;
  WBNB_ADDRESS: string;
  CAKE_ADDRESS: string;
  RPC: string;
  CHAIN_ID: number;
  privateKey: string;
  provider: ethers.JsonRpcProvider;
  wallet: ethers.Wallet;
  UNIVERSAL_ROUTER_ADDRESS: string;
  receiver: string;
  permit2: string;
  constructor() {
    this.PANCAKE_V3_SWAP_ROUTER_ADDRESS =
      '0xd77C2afeBf3dC665af07588BF798bd938968c72E';
    this.WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    this.CAKE_ADDRESS = '0x8d008b313c1d6c7fe2982f62d32da7507cf43551';
    this.permit2 = '0x31c2f6fcff4f8759b3bd5bf0e1084a055615c768';
    this.RPC = 'https://bsc-testnet-rpc.publicnode.com';
    this.privateKey =
      '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449';
    this.provider = new ethers.JsonRpcProvider(this.RPC);
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    this.UNIVERSAL_ROUTER_ADDRESS =
      '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';
    this.receiver = '0xC1ad7E6c81113aD0C15ee6C3F8B7c19DCdEa0143';
    this.CHAIN_ID = ChainId.BSC_TESTNET;
  }

  async onApplicationBootstrap() {
    const amountIn = ethers.parseEther('10');
    const inputToken = new Token(
      this.CHAIN_ID,
      this.WBNB_ADDRESS as any,
      18,
      'WBNB',
      'Wrapped BNB',
    );
    const outputToken = new Token(
      this.CHAIN_ID,
      this.CAKE_ADDRESS as any,
      18,
      'CAKE',
      'PancakeSwap Token',
    );
    await this.pancakeSwapV3(outputToken, inputToken, amountIn);
  }
  getHello(): string {
    return 'Hello World!';
  }

  async pancakeSwapV3(inputToken: Token, outputToken: Token, amountIn: bigint) {
    const provider = new ethers.JsonRpcProvider(this.RPC);
    const wallet = new ethers.Wallet(this.privateKey, provider);
    // approve token
    await this.approveToken(inputToken.address, amountIn);

    const pool = makePool(inputToken, outputToken);

    const trade = await Trade.fromRoute(
      new Route([pool], inputToken, outputToken),
      CurrencyAmount.fromRawAmount(inputToken, amountIn),
      TradeType.EXACT_INPUT,
    );
    console.log(
      '🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ trade:',
      pool,
      trade,
    );
    //const slippageTolerance = new Percent(1, 100);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const feeData = await this.provider.getFeeData();

    const gasPrice = (feeData.gasPrice * BigInt(12)) / BigInt(10); // Add 20% buffer

    const ROUTER_ABI = [
      'function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) payable returns (bytes[] memory)',
    ];
    // const routerInterface = new ethers.Interface(ROUTER_ABI);

    const router = new ethers.Contract(
      this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
      ROUTER_ABI,
      wallet,
    );

    const values = [2n, amountIn];
    // data source 1
    const abiCoder = new AbiCoder();
    const encoded = abiCoder.encode(['uint256', 'uint256'], values);
    console.log('🚀 ~ AppService ~ pancakeSwapV3 ~ encoded:', encoded);

    // data source 2
    const path = this.encodePath(
      [inputToken.address, outputToken.address],
      [2500], // 0.25% fee tier
    );
    //console.log('🚀 ~ AppService ~ pancakeSwapV3 ~ path:', path);

    const encodedParams = abiCoder.encode(
      ['address', 'uint256', 'uint256', 'bytes', 'uint256'],
      [this.receiver, amountIn, 0, path, 0],
    );
    // console.log(
    //   '🚀 ~ AppService ~ pancakeSwapV3 ~ encodedParams:',
    //   encodedParams,
    // );

    const hashInput2 = [encoded, encodedParams];
    const command = '0x0b00'; // command for V2_SWAP_EXACT_IN
    const tx = await router.execute(command, hashInput2, deadline, {
      value:
        inputToken.address === this.WBNB_ADDRESS || inputToken.isNative
          ? amountIn
          : 0,
      gasLimit: 300000,
      nonce: await this.wallet.getNonce(),
      gasPrice: gasPrice,
    });

    console.log('🚀 ~ AppService ~ pancakeSwapV3 ~ txRequest:', tx);

    const res = await wallet.sendTransaction(tx);
    const receipt = await res.wait();
    console.log('🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ res:', receipt, res);
  }

  encodePath(path: string[], fees: number[]): string {
    let encoded = '0x';
    for (let i = 0; i < fees.length; i++) {
      encoded += path[i].slice(2);
      encoded += fees[i].toString(16).padStart(6, '0');
    }
    encoded += path[path.length - 1].slice(2);
    return encoded;
  }

  async approveToken(token: string, amount: bigint) {
    const ERC20_ABI = [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
    ];
    const inputTokenContract = new ethers.Contract(
      token,
      ERC20_ABI,
      this.wallet,
    );
    const currentAllowance = await inputTokenContract.allowance(
      this.wallet.address,
      this.permit2,
    );

    if (currentAllowance.lt(amount)) {
      const maxUnint256 =
        '115792089237316195423570985008687907853269984665640564039457584007913129639935';
      const tx = await inputTokenContract.approve(this.permit2, maxUnint256);
      await tx.wait();
      console.log('Token approved');
    }
  }
}
