import { Injectable } from '@nestjs/common';

import { Currency, TradeType, CurrencyAmount, Token, Percent } from '@pancakeswap/sdk'
import { SmartRouter } from '@pancakeswap/smart-router'
import { ChainId } from '@pancakeswap/chains'
import { ethers } from 'ethers';
import { Address } from 'cluster';
import { SwapRouter } from '@pancakeswap/smart-router'
import { GraphQLClient } from 'graphql-request'

@Injectable()
export class AppService {
  PANCAKE_V3_SWAP_ROUTER_ADDRESS: string;
  WBNB_ADDRESS: string;
  CAKE_ADDRESS: string;
  RPC: string;
  privateKey: string;
  provider: ethers.JsonRpcProvider;
  wallet: ethers.Wallet;
  constructor() {
     this.PANCAKE_V3_SWAP_ROUTER_ADDRESS = '0xd77C2afeBf3dC665af07588BF798bd938968c72E';
     this.WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
     this.CAKE_ADDRESS= '0x8d008b313c1d6c7fe2982f62d32da7507cf43551';
     this.RPC= 'https://bsc-testnet-rpc.publicnode.com';
     this.privateKey = "0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449";
     this.provider = new ethers.JsonRpcProvider(this.RPC);
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
  }

  async onApplicationBootstrap() {
   // await this.approveToken(this.WBNB_ADDRESS, ethers.MaxUint256.toString())
  
    // Then execute the swap
    await this.executeSwap()
  }
  getHello(): string {
   
    return 'Hello World!';
  }

  async  executeSwap() {
    // 1. Setup provider and signer

    const WBNB = new Token(
      ChainId.BSC_TESTNET,
      this.WBNB_ADDRESS as any,
      18,
      'WBNB',
      'Wrapped BNB',
    );

    const CAKE = new Token(
      ChainId.BSC_TESTNET,
      this.CAKE_ADDRESS as any,
      18,
      'CAKE',
      'PancakeSwap Token',
    );
 
      // const [v2Pools, v3Pools] = await Promise.all([
      //   SmartRouter.getV2CandidatePools({
      //     onChainProvider: () => publicClient,
      //     v2SubgraphProvider: () => v2SubgraphClient,
      //     v3SubgraphProvider: () => v3SubgraphClient,
      //     currencyA: amount.currency,
      //     currencyB: swapTo,
      //   }),
      //   SmartRouter.getV3CandidatePools({
      //     onChainProvider: () => publicClient,
      //     subgraphProvider: () => v3SubgraphClient,
      //     currencyA: amount.currency,
      //     currencyB: swapTo,
      //     subgraphFallback: false,
      //   }),
      // ])
    
    const amountIn = CurrencyAmount.fromRawAmount(
      WBNB,
      '1000000000000000' 
    )
    console.log("🚀 ~ AppService ~ executeSwap ~ amountIn:", amountIn)
    const quoteProvider = SmartRouter.createQuoteProvider({
      onChainProvider: () => this.provider as any,
    })
    const v3SubgraphClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc')
    const v2SubgraphClient = new GraphQLClient('https://proxy-worker-api.pancakeswap.com/bsc-exchange')
    
    const [v2Pools, v3Pools] = await Promise.all([
      SmartRouter.getV2CandidatePools({
        onChainProvider: () => this.provider  as any,
        v2SubgraphProvider: () => v2SubgraphClient as any,
        v3SubgraphProvider: () => v3SubgraphClient as any,
        currencyA: amountIn.currency,
        currencyB: CAKE,
      }),
      SmartRouter.getV3CandidatePools({
        onChainProvider: () => this.provider  as any,
        subgraphProvider: () => v3SubgraphClient as any,
        currencyA: amountIn.currency,
        currencyB: CAKE,  
        subgraphFallback: false,
      }),
    ])
    const pools = [...v2Pools, ...v3Pools]
    console.log("🚀 ~ AppService ~ executeSwap ~ pools:", pools)
   
    // 3. Get the best trade route
    const trade = await SmartRouter.getBestTrade(
      amountIn,
      CAKE,
      TradeType.EXACT_INPUT,
      {
        gasPriceWei:  (await this.provider.getFeeData()).gasPrice,
        maxHops: 2,
        maxSplits: 2,
        //poolProvider: SmartRouter.createStaticPoolProvider(pools),
        provider: this.provider,
        chainId: ChainId.BSC_TESTNET,
        quoteProvider,
        quoterOptimization: true,
      }
    )
    console.log("🚀 ~ AppService ~ executeSwap ~ trade:", trade)
  
    if (!trade) {
      throw new Error('No route found')
    }
  
    // 4. Create Universal Router instance
    // const universalRouter = new PancakeSwapSDK.PancakeSwapTrade({
    //   chainId: ChainId.BSC_TESTNET,
    //   provider: this.provider,
    // })

    // const trade = await SmartRouter.getBestTrade(amount, swapTo, TradeType.EXACT_INPUT, {
    //   gasPriceWei: () => publicClient.getGasPrice(),
    //   maxHops: 2,
    //   maxSplits: 2,
    //   poolProvider: SmartRouter.createStaticPoolProvider(pools),
    //   quoteProvider,
    //   quoterOptimization: true,
    // })
  
    // 5. Prepare transaction parameters
    const { calldata, value } = await SwapRouter.swapCallParameters(trade,{
      slippageTolerance: new Percent(50, 10000), // 0.5%
      recipient: await this.wallet.getAddress() as any,
    })
  
    // 6. Execute the swap
    const tx = {
      data: calldata,
      to: this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
      value: value,
      from: await this.wallet.getAddress(),
    }
  
    // 7. Send transaction
    try {
      const transaction = await this.wallet.sendTransaction(tx)
      const receipt = await transaction.wait()
      console.log('Swap successful:', receipt)
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

   async approveToken(token: string, amount: string) {
    const provider = new ethers.JsonRpcProvider(this.RPC);
    const wallet = new ethers.Wallet(this.privateKey, provider);
    
    const tokenContract = new ethers.Contract(
      token,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      this.wallet
    )
  
    try {
      const tx = await tokenContract.approve(
        this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
        amount
      )
      await tx.wait()
      console.log('Token approved')
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }
}
