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
  privateKey: string;
  provider: ethers.JsonRpcProvider;
  wallet: ethers.Wallet;
  UNIVERSAL_ROUTER_ADDRESS: string;
  receiver: string;
  constructor() {
    this.PANCAKE_V3_SWAP_ROUTER_ADDRESS =
      '0xd77C2afeBf3dC665af07588BF798bd938968c72E';
    this.WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    this.CAKE_ADDRESS = '0x8d008b313c1d6c7fe2982f62d32da7507cf43551';
    this.RPC = 'https://bsc-testnet-rpc.publicnode.com';
    this.privateKey =
      '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449';
    this.provider = new ethers.JsonRpcProvider(this.RPC);
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    this.UNIVERSAL_ROUTER_ADDRESS =
      '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';
    this.receiver = '0xC1ad7E6c81113aD0C15ee6C3F8B7c19DCdEa0143';
  }

  async onApplicationBootstrap() {
    await this.pancakeSwapV3();
  }
  getHello(): string {
    return 'Hello World!';
  }

  async pancakeSwapV3() {
    const provider = new ethers.JsonRpcProvider(this.RPC);
    const wallet = new ethers.Wallet(this.privateKey, provider);

    const InputData = new Token(
      ChainId.BSC_TESTNET,
      this.WBNB_ADDRESS as any,
      18,
      'WBNB',
      'Wrapped BNB',
    );

    const OutPutData = new Token(
      ChainId.BSC_TESTNET,
      this.CAKE_ADDRESS as any,
      18,
      'CAKE',
      'PancakeSwap Token',
    );
    const pool = makePool(InputData, OutPutData);

    const trade = await Trade.fromRoute(
      new Route([pool], InputData, OutPutData),
      CurrencyAmount.fromRawAmount(InputData, 1000000000000000),
      TradeType.EXACT_INPUT,
    );
    console.log(
      '🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ trade:',
      pool,
      trade,
    );
    //const slippageTolerance = new Percent(1, 100);
    const amountIn = ethers.parseEther('0.01');
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
    // const hashInput = [
    //   '0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc10000',
    //   '0x000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea0143000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000017f6c534a77f689a00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000',
    // ];

    const values = [2n, amountIn];
    // data source 1
    const abiCoder = new AbiCoder();
    const encoded = abiCoder.encode(['uint256', 'uint256'], values);
    console.log('🚀 ~ AppService ~ pancakeSwapV3 ~ encoded:', encoded);

    // data source 2
    const path = this.encodePath(
      [this.WBNB_ADDRESS, this.CAKE_ADDRESS],
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

    // decode
    // const a =
    //   '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000676010d600000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea0143000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000017fa5f91bf8f7a1900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000';
    // const encodedParams32 = abiCoder.decode(['bytes', 'bytes[]', 'uint256'], a);
    // console.log(
    //   '🚀 ~ AppService ~ pancakeSwapV3 ~ encodedParams32:',
    //   encodedParams32.toString(),
    // );

    const tx = await router.execute(
      '0x0b00', // command for V2_SWAP_EXACT_IN
      hashInput2,
      deadline,
      {
        value: amountIn, // Required for native token swaps
        gasLimit: 300000,
        nonce: await this.wallet.getNonce(),
        gasPrice: gasPrice,
      },
    );

    console.log('🚀 ~ AppService ~ pancakeSwapV3 ~ txRequest:', tx);

    const res = await wallet.sendTransaction(tx);
    const receipt = await res.wait();
    console.log('🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ res:', receipt, res);
  }

  // Helper function to encode path
  encodePath(path: string[], fees: number[]): string {
    let encoded = '0x';
    for (let i = 0; i < fees.length; i++) {
      // Encode token address (20 bytes)
      encoded += path[i].slice(2);
      // Encode fee (3 bytes)
      encoded += fees[i].toString(16).padStart(6, '0');
    }
    // Encode final token address
    encoded += path[path.length - 1].slice(2);
    return encoded;
  }

  async approveToken(token: string, amount: string) {
    const provider = new ethers.JsonRpcProvider(this.RPC);
    const wallet = new ethers.Wallet(this.privateKey, provider);

    const tokenContract = new ethers.Contract(
      token,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      this.wallet,
    );

    try {
      const tx = await tokenContract.approve(
        this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
        amount,
      );
      await tx.wait();
      console.log('Token approved');
    } catch (error) {
      console.error('Approval failed:', error);
    }
  }
}
