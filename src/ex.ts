// import { Injectable } from '@nestjs/common';
// import { ethers, BigNumberish, BigNumber } from 'ethers';
// import { Token, TradeType, Fetcher, CurrencyAmount } from '@pancakeswap/sdk';
// import {
//   Pool,
//   Position,
//   NonfungiblePositionManager,
//   SwapRouter,
//   nearestUsableTick,
//   TickMath,
//   Trade,
//   Route,
// } from '@pancakeswap/v3-sdk';
// import ISwapRouter from '@pancakeswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json';
// import IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
// import IUniswapV3Factory from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
// import { AbiCoder, solidityPack } from 'ethers/lib/utils';
// import QuoterABI from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
// import { AlphaRouter } from '@uniswap/smart-order-router';
// import { Percent } from '@pancakeswap/sdk';

// interface SwapParams {
//   tokenIn: Token;
//   tokenOut: Token;
//   fee: number;
//   recipient: string;
//   deadline: number;
//   amountIn: string;
//   amountOutMinimum: string;
//   sqrtPriceLimitX96: string;
// }
// import ERC20_abi from './erc20.json';
// // import {
// //   Token,
// //   TradeType,
// //   Route,
// //   Trade,
// //   Fetcher,
// //   Percent,
// // } from '@uniswap/sdk-core';
// import { FeeAmount, TICK_SPACINGS } from './constants';
// import { BigintIsh, sqrt } from '@pancakeswap/swap-sdk-core';
// import { WETH9 } from '@pancakeswap/sdk';

// export function encodeSqrtRatioX96(
//   amount1: BigintIsh,
//   amount0: BigintIsh,
// ): bigint {
//   const numerator = BigInt(amount1) << 192n;
//   const denominator = BigInt(amount0);
//   const ratioX192 = numerator / denominator;
//   return sqrt(ratioX192);
// }

// const feeAmount = FeeAmount.MEDIUM;
// const sqrtRatioX96 = encodeSqrtRatioX96(1, 1);
// const liquidity = 1_000_000;
// const WETH = WETH9[1];
// const makePool = (token0: Token, token1: Token) => {
//   return new Pool(
//     token0,
//     token1,
//     feeAmount,
//     sqrtRatioX96,
//     liquidity,
//     TickMath.getTickAtSqrtRatio(sqrtRatioX96),
//     [
//       {
//         index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
//         liquidityNet: liquidity,
//         liquidityGross: liquidity,
//       },
//       {
//         index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
//         liquidityNet: -liquidity,
//         liquidityGross: liquidity,
//       },
//     ],
//   );
// };

// @Injectable()
// export class PancakeswapService {
//   chainId: 97; //  // real : 56
//   PANCAKE_V3_SWAP_ROUTER_ADDRESS: '0xd77C2afeBf3dC665af07588BF798bd938968c72E';
//   WBNB_ADDRESS: '0xae13d989dac2f0debff460ac112a837c89baa7cd';
//   CAKE_ADDRESS: '0x8d008b313c1d6c7fe2982f62d32da7507cf43551';
//   RPC: 'https://bsc-testnet-rpc.publicnode.com';
//   private: '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449';
//   ROUTER_ABI = [
//     'function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable returns (bytes[] outputs)',
//     // Add approve function if dealing with ERC20
//     'function approve(address spender, uint256 amount) external returns (bool)',
//   ];
//   wallet: string;

//   constructor() {
//     this.chainId = 97; //  // real : 56
//     this.PANCAKE_V3_SWAP_ROUTER_ADDRESS =
//       '0xd77C2afeBf3dC665af07588BF798bd938968c72E'; //0x1A0A18AC4BECDDbd6389559687d1A73d8927E416
//     this.WBNB_ADDRESS = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
//     this.CAKE_ADDRESS = '0x8d008b313c1d6c7fe2982f62d32da7507cf43551';
//     this.RPC = 'https://bsc-testnet-rpc.publicnode.com';
//     this.private =
//       '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449';
//     this.wallet = '0xC1ad7E6c81113aD0C15ee6C3F8B7c19DCdEa0143';
//   }

//   async onApplicationBootstrap() {
//     // this.executeSwap2(this.CAKE_ADDRESS, this.WBNB_ADDRESS, '0.003');
//     //this.executeSwap();
//     //this.exactInputSingleTrade2();
//     //await this.swapBNBForCake();
//     //await this.swap2();
//     //await this.pancakeSwapV3();
//     await this.pancakeswapv3_2();
//   }
//   async pancakeswapv3_2() {
//     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//     const wallet = new ethers.Wallet(this.private, provider);
//     const router = new ethers.Contract(
//       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//       this.ROUTER_ABI,
//       wallet,
//     );

//     // Amount to swap (0.001 BNB)
//     const amountIn = ethers.utils.parseEther('0.001');

//     // Encode the swap parameters
//     const swapParams = {
//       tokenIn: this.WBNB_ADDRESS,
//       tokenOut: this.CAKE_ADDRESS,
//       fee: 3000, // 0.3%
//       recipient: this.wallet,
//       amountIn: amountIn,
//       amountOutMinimum: 0,
//       sqrtPriceLimitX96: 0,
//     };

//     // Encode the path
//     const path = ethers.utils.solidityPack(
//       ['address', 'uint24', 'address'],
//       [swapParams.tokenIn, swapParams.fee, swapParams.tokenOut],
//     );

//     // Encode the exact input params
//     const exactInputParams = ethers.utils.defaultAbiCoder.encode(
//       [
//         '(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum)',
//       ],
//       [
//         [
//           path,
//           swapParams.recipient,
//           swapParams.amountIn,
//           swapParams.amountOutMinimum,
//         ],
//       ],
//     );

//     try {
//       // Execute the swap
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
//       const tx = await router.execute(
//         '0x0b', // command for exact input swap
//         [exactInputParams],
//         deadline,
//         {
//           value: amountIn,
//           gasLimit: 300000,
//         },
//       );

//       console.log('Transaction hash:', tx.hash);
//       const receipt = await tx.wait();
//       console.log('Swap executed successfully:', receipt);
//     } catch (error) {
//       console.error('Error executing swap:', error);
//       throw error;
//     }
//     //       ICLRouterBase.CLSwapExactInputSingleParams memory params =
//     // ICLRouterBase.CLSwapExactInputSingleParams({
//     //       poolKey: poolKey, // struct which determine the poolKey
//     //       zeroForOne: true, // if true, means 0->1 else 1->0
//     //       amountIn: amountIn, // amountIn
//     //       amountOutMinimum: 0, // minAmountOut, ideally it should not be 0
//     //       sqrtPriceLimitX96: 0, // price limit set by user
//     //       hookData: "" // hook data
//     // });

//     // // Step 2: build the v4 payload
//     // Plan plan = Planner.init();
//     // plan.add(Actions.CL_SWAP_EXACT_IN_SINGLE, abi.encode(params));
//     // bytes memory data = plan.finalizeSwap(poolKey.currency0, poolKey.currency1, ActionConstants.MSG_SENDER);

//     // // step 3: build command/input
//     // bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.V4_SWAP)));
//     // bytes[] memory inputs = new bytes[](1);
//     // inputs[0] = data;

//     // // Step 4: call universal router
//     // router.execute(commands, inputs);
//     //     const abiCoder = new AbiCoder();
//     //     const a =
//     //       '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000675c1ef600000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea014300000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000028c96a0dd07f05100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000';
//     //     const decoded = abiCoder.decode(['bytes', 'bytes[]', 'uint256'], a);
//     //     console.log(
//     //       '🚀 ~ PancakeswapService ~ pancakeswapv3_2 ~ decoded:',
//     //       decoded,
//     //     );

//     //           '0x0b00',
//     //   [
//     //     '0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000038d7ea4c68000',
//     //     '0x000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea014300000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000028c96a0dd07f05100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000'
//     //   ],
//     //   BigNumber { _hex: '0x675c1ef6', _isBigNumber: true }
//   }
//   //[
//   //   {
//   //     "type": "bytes"
//   //   },
//   //   {
//   //     "type": "bytes[]"
//   //   },
//   //   {
//   //     "type": "uint256"
//   //   }
//   // ]
//   async pancakeSwapV3() {
//     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//     const wallet = new ethers.Wallet(this.private, provider);

//     const WBNB = new Token(
//       this.chainId,
//       this.WBNB_ADDRESS,
//       18,
//       'WBNB',
//       'Wrapped BNB',
//     );

//     const CAKE = new Token(
//       this.chainId,
//       this.CAKE_ADDRESS,
//       18,
//       'CAKE',
//       'PancakeSwap Token',
//     );
//     const pool_0_1 = makePool(WBNB, CAKE);

//     const trade = await Trade.fromRoute(
//       new Route([pool_0_1], WBNB, CAKE),
//       CurrencyAmount.fromRawAmount(WBNB, 100),
//       TradeType.EXACT_INPUT,
//     );
//     console.log(
//       '🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ trade:',
//       pool_0_1,
//       trade,
//     );
//     const slippageTolerance = new Percent(1, 100);
//     const recipient = this.wallet;
//     const deadline = 123;
//     const { calldata, value } = SwapRouter.swapCallParameters(trade, {
//       slippageTolerance,
//       recipient,
//       deadline,
//     });
//     console.log(
//       '🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ calldata:',
//       calldata,
//       value,
//     );
//     //0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000675c1a4900000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea014300000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000028c96a0dd07f05100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000
//     const tx = {
//       data: calldata,
//       to: this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//       value: ethers.utils.parseEther('0.001'),
//       from: this.wallet,
//       gasLimit: '300000',
//     };

//     const res = await wallet.sendTransaction(tx);
//     const receipt = await res.wait();
//     console.log('🚀 ~ PancakeswapService ~ pancakeSwapV3 ~ res:', receipt, res);
//   }

//   async swap2() {
//     const chainId = this.chainId; // chainId must be integer
//     const walletAddress = this.wallet;
//     const tokenInContractAddress = this.WBNB_ADDRESS;
//     const tokenOutContractAddress = this.CAKE_ADDRESS;
//     const inAmountStr = '0.001';

//     // ============= PART 1 --- connect to blockchain and get token balances
//     console.log('Connecting to blockchain, loading token balances...');
//     console.log('');

//     // Ethers.js provider to access blockchain
//     // As we're using Alchemy, it is JsonRpcProvider
//     // In case of React app + MetaMask it should be initialized as "new ethers.providers.Web3Provider(window.ethereum);"
//     const provider = new ethers.providers.JsonRpcProvider(this.RPC, chainId);

//     const signer = new ethers.Wallet(this.private, provider);

//     // // In case of React + Metamask it should be initialized as "provider.getSigner();"
//     // // as we already have signer provided by Metamask
//     // var signer = wallet.provider.getSigner(wallet.address);

//     // create token contracts and related objects
//     const contractIn = new ethers.Contract(
//       tokenInContractAddress,
//       ERC20_abi,
//       signer,
//     );
//     const contractOut = new ethers.Contract(
//       tokenOutContractAddress,
//       ERC20_abi,
//       signer,
//     );

//     const getTokenAndBalance = async function (contract: ethers.Contract) {
//       var [dec, symbol, name, balance] = await Promise.all([
//         contract.decimals(),
//         contract.symbol(),
//         contract.name(),
//         contract.balanceOf(walletAddress),
//       ]);

//       return [
//         new Token(
//           chainId,
//           `0x${contract.address.substring(2)}`,
//           dec,
//           symbol,
//           name,
//         ),
//         balance,
//       ];
//     };

//     const [tokenIn, balanceTokenIn] = await getTokenAndBalance(contractIn);
//     const [tokenOut, balanceTokenOut] = await getTokenAndBalance(contractOut);

//     console.log(`Wallet ${walletAddress} balances:`);
//     console.log(
//       `   Input: ${tokenIn.symbol} (${tokenIn.name}): ${ethers.utils.formatUnits(balanceTokenIn, tokenIn.decimals)}`,
//     );
//     console.log(
//       `   Output: ${tokenOut.symbol} (${tokenOut.name}): ${ethers.utils.formatUnits(balanceTokenOut, tokenOut.decimals)}`,
//     );
//     console.log(tokenIn.address, tokenOut.address);

//     // ============= PART 2 --- get Uniswap pool for pair TokenIn-TokenOut
//     console.log('Loading pool information...');

//     // this is Uniswap factory, same address on all chains
//     // (from https://docs.uniswap.org/protocol/reference/deployments)
//     const UNISWAP_FACTORY_ADDRESS =
//       '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
//     const factoryContract = new ethers.Contract(
//       UNISWAP_FACTORY_ADDRESS,
//       IUniswapV3Factory.abi,
//       provider,
//     );
//     console.log(
//       '🚀 ~ PancakeswapService ~ swap2 ~ factoryContract:',
//       factoryContract,
//     );

//     // loading pool smart contract address
//     const poolAddress = await factoryContract.getPool(
//       tokenIn.address,
//       tokenOut.address,
//       3000,
//     ); // commission - 3%
//     console.log('🚀 ~ PancakeswapService ~ swap2 ~ poolAddress:', poolAddress);

//     if (Number(poolAddress).toString() === '0')
//       // there is no such pool for provided In-Out tokens.
//       throw `Error: No pool ${tokenIn.symbol}-${tokenOut.symbol}`;

//     const poolContract = new ethers.Contract(
//       poolAddress,
//       IUniswapV3Pool.abi,
//       provider,
//     );

//     const getPoolState = async function () {
//       const [liquidity, slot] = await Promise.all([
//         poolContract.liquidity(),
//         poolContract.slot0(),
//       ]);

//       return {
//         liquidity: liquidity,
//         sqrtPriceX96: slot[0],
//         tick: slot[1],
//         observationIndex: slot[2],
//         observationCardinality: slot[3],
//         observationCardinalityNext: slot[4],
//         feeProtocol: slot[5],
//         unlocked: slot[6],
//       };
//     };

//     const getPoolImmutables = async function () {
//       const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
//         await Promise.all([
//           poolContract.factory(),
//           poolContract.token0(),
//           poolContract.token1(),
//           poolContract.fee(),
//           poolContract.tickSpacing(),
//           poolContract.maxLiquidityPerTick(),
//         ]);

//       return {
//         factory: factory,
//         token0: token0,
//         token1: token1,
//         fee: fee,
//         tickSpacing: tickSpacing,
//         maxLiquidityPerTick: maxLiquidityPerTick,
//       };
//     };

//     // loading immutable pool parameters and its current state (variable parameters)
//     const [immutables, state] = await Promise.all([
//       getPoolImmutables(),
//       getPoolState(),
//     ]);

//     const pool = new Pool(
//       tokenIn,
//       tokenOut,
//       immutables.fee,
//       state.sqrtPriceX96.toString(),
//       state.liquidity.toString(),
//       state.tick,
//     );

//     // print token prices in the pool
//     console.log('Token prices in pool:');
//     console.log(
//       `   1 ${pool.token0.symbol} = ${pool.token0Price.toSignificant()} ${pool.token1.symbol}`,
//     );
//     console.log(
//       `   1 ${pool.token1.symbol} = ${pool.token1Price.toSignificant()} ${pool.token0.symbol}`,
//     );
//     console.log('');

//     // ============= PART 3 --- Giving a quote for user input
//     console.log('Loading up quote for a swap...');

//     const amountIn = ethers.utils.parseUnits(inAmountStr, tokenIn.decimals);

//     const UNISWAP_QUOTER_ADDRESS = '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2';
//     const quoterContract = new ethers.Contract(
//       UNISWAP_QUOTER_ADDRESS,
//       QuoterABI.abi,
//       provider,
//     );

//     const quotedAmountOut =
//       await quoterContract.callStatic.quoteExactInputSingle(
//         tokenIn.address,
//         tokenOut.address,
//         pool.fee,
//         amountIn,
//         0,
//       );

//     console.log(
//       `   You'll get approximately ${ethers.utils.formatUnits(quotedAmountOut, tokenOut.decimals)} ${tokenOut.symbol} for ${inAmountStr} ${tokenIn.symbol}`,
//     );
//     console.log('');

//     // ============= PART 4 --- Loading a swap route
//     console.log('');
//     console.log('Loading a swap route...');

//     const inAmount = CurrencyAmount.fromRawAmount(tokenIn, amountIn.toString());

//     const router = new AlphaRouter({
//       chainId: tokenIn.chainId,
//       provider: provider,
//     });
//     const route = await router.route(
//       inAmount as any,
//       tokenOut,
//       TradeType.EXACT_INPUT,
//       // swapOptions
//       // {
//       //   recipient: walletAddress,
//       //   slippageTolerance: new Percent(5, 100), // Big slippage – for a test
//       //   deadline: Math.floor(Date.now() / 1000 + 1800), // add 1800 seconds – 30 mins deadline
//       // },
//       // router config
//       // {
//       //   maxSwapsPerPath: 1, // remove this if you want multi-hop swaps as well.
//       // },
//     );

//     if (route == null || route.methodParameters === undefined)
//       throw 'No route loaded';

//     console.log(`   You'll get ${route.quote.toFixed()} of ${tokenOut.symbol}`);

//     // output quote minus gas fees
//     console.log(`   Gas Adjusted Quote: ${route.quoteGasAdjusted.toFixed()}`);
//     console.log(
//       `   Gas Used Quote Token: ${route.estimatedGasUsedQuoteToken.toFixed()}`,
//     );
//     console.log(`   Gas Used USD: ${route.estimatedGasUsedUSD.toFixed()}`);
//     console.log(`   Gas Used: ${route.estimatedGasUsed.toString()}`);
//     console.log(`   Gas Price Wei: ${route.gasPriceWei}`);
//     console.log('');

//     // // ============= PART 5 --- Making actual swap
//     console.log('Approving amount to spend...');

//     // address of a swap router
//     const V3_SWAP_ROUTER_ADDRESS = '0x9a489505a00cE272eAa5e07Dba6491314CaE3796';

//     // For Metamask it will be just "await contractIn.approve(V3_SWAP_ROUTER_ADDRESS, amountIn);"

//     // here we just create a transaction object (not sending it to blockchain).
//     const approveTxUnsigned = await contractIn.populateTransaction.approve(
//       V3_SWAP_ROUTER_ADDRESS,
//       amountIn,
//     );
//     // by default chainid is not set https://ethereum.stackexchange.com/questions/94412/valueerror-code-32000-message-only-replay-protected-eip-155-transac
//     approveTxUnsigned.chainId = chainId;
//     // estimate gas required to make approve call (not sending it to blockchain either)
//     approveTxUnsigned.gasLimit = await contractIn.estimateGas.approve(
//       V3_SWAP_ROUTER_ADDRESS,
//       amountIn,
//     );
//     // suggested gas price (increase if you want faster execution)
//     approveTxUnsigned.gasPrice = await provider.getGasPrice();
//     // nonce is the same as number previous transactions
//     approveTxUnsigned.nonce = await provider.getTransactionCount(walletAddress);

//     // sign transaction by our signer
//     const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
//     // submit transaction to blockchain
//     const submittedTx = await provider.sendTransaction(approveTxSigned);
//     // wait till transaction completes
//     const approveReceipt = await submittedTx.wait();
//     if (approveReceipt.status === 0)
//       throw new Error('Approve transaction failed');

//     console.log('Making a swap...');
//     const value = BigNumber.from(route.methodParameters.value);

//     const transaction = {
//       data: route.methodParameters.calldata,
//       to: V3_SWAP_ROUTER_ADDRESS,
//       value: value,
//       from: walletAddress,
//       gasPrice: route.gasPriceWei,

//       // route.estimatedGasUsed might be too low!
//       // most of swaps I tested fit into 300,000 but for some complex swaps this gas is not enough.
//       // Loot at etherscan/polygonscan past results.
//       gasLimit: BigNumber.from('800000'),
//     };

//     var tx = await signer.sendTransaction(transaction);
//     const receipt = await tx.wait();
//     if (receipt.status === 0) {
//       throw new Error('Swap transaction failed');
//     }

//     // ============= Final part --- printing results
//     const [newBalanceIn, newBalanceOut] = await Promise.all([
//       contractIn.balanceOf(walletAddress),
//       contractOut.balanceOf(walletAddress),
//     ]);

//     console.log('');
//     console.log('Swap completed successfully! ');
//     console.log('');
//     console.log('Updated balances:');
//     console.log(
//       `   ${tokenIn.symbol}: ${ethers.utils.formatUnits(newBalanceIn, tokenIn.decimals)}`,
//     );
//     console.log(
//       `   ${tokenOut.symbol}: ${ethers.utils.formatUnits(newBalanceOut, tokenOut.decimals)}`,
//     );
//   }

//   encodeRouteToPath(tokens: Token[], fees: number[]): string {
//     let path = '';
//     for (let i = 0; i < tokens.length - 1; i++) {
//       path += tokens[i].address;
//       path += ethers.utils
//         .hexZeroPad(ethers.utils.hexlify(fees[i]), 3)
//         .slice(2);
//     }
//     path += tokens[tokens.length - 1].address;
//     return path.toLowerCase();
//   }

//   async swapBNBForCake() {
//     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//     const wallet = new ethers.Wallet(this.private, provider);

//     try {
//       // Initialize tokens
//       const WBNB = new Token(
//         this.chainId,
//         this.WBNB_ADDRESS,
//         18,
//         'WBNB',
//         'Wrapped BNB',
//       );

//       const CAKE = new Token(
//         this.chainId,
//         this.CAKE_ADDRESS,
//         18,
//         'CAKE',
//         'PancakeSwap Token',
//       );

//       // Initialize amounts
//       const amountIn = CurrencyAmount.fromRawAmount(WBNB, '2000000000000000');

//       // Create path
//       const path = ethers.utils.solidityPack(
//         ['address', 'uint24', 'address'],
//         [this.WBNB_ADDRESS, 3000, this.CAKE_ADDRESS],
//       );

//       // Create router contract
//       const routerContract = new ethers.Contract(
//         this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//         [
//           'function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable returns (bytes[] memory)',
//         ],
//         wallet,
//       );

//       const params = {
//         path,
//         recipient: this.wallet,
//         amountIn: amountIn.quotient.toString(),
//         amountOutMinimum: 0,
//       };

//       const encodedParams = ethers.utils.defaultAbiCoder.encode(
//         [
//           '(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum)',
//         ],
//         [params],
//       );

//       const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

//       const tx = await routerContract.execute(
//         '0x0b00',
//         [encodedParams],
//         deadline,
//         {
//           value: amountIn.quotient.toString(),
//           gasLimit: 300000,
//         },
//       );

//       console.log('Transaction hash:', tx.hash);
//       const receipt = await tx.wait();
//       console.log('Transaction was mined in block:', receipt);

//       // Check balances after swap
//     } catch (error) {
//       console.error('Error in swap:', error);
//       throw error;
//     }
//   }

//   async exactInputSingleTrade2() {
//     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//     const wallet = new ethers.Wallet(this.private, provider);

//     const ROUTER_ABI = [
//       'function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable returns (bytes[] outputs)',
//     ];
//     const ERC20_ABI = [
//       'function approve(address spender, uint256 amount) external returns (bool)',
//       'function allowance(address owner, address spender) view returns (uint256)',
//     ];

//     // Create WBNB contract instance
//     const wbnbContract = new ethers.Contract(
//       this.WBNB_ADDRESS,
//       ERC20_ABI,
//       wallet,
//     );

//     // Check current allowance
//     const currentAllowance = await wbnbContract.allowance(
//       wallet.address,
//       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//     );
//     console.log(
//       '🚀 ~ PancakeswapService ~ exactInputSingleTrade2 ~ currentAllowance:',
//       currentAllowance.toString(),
//     );

//     const amountIn = ethers.utils.parseEther('0.001');

//     // If allowance is insufficient, approve
//     if (currentAllowance.lt(amountIn)) {
//       console.log('Approving WBNB...');
//       const approveTx = await wbnbContract.approve(
//         this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//         ethers.constants.MaxUint256, // Infinite approval, or use specific amount
//       );
//       await approveTx.wait();
//       console.log('Approval successful');
//     }

//     const router = new ethers.Contract(
//       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//       ROUTER_ABI,
//       wallet,
//     );

//     try {
//       const commands = '0x0b00';
//       const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
//       const path = ethers.utils.solidityPack(
//         ['address', 'uint24', 'address'],
//         [this.WBNB_ADDRESS, 3000, this.CAKE_ADDRESS],
//       );

//       const inputs = [
//         ethers.utils.defaultAbiCoder.encode(
//           ['address', 'uint256', 'uint256', 'bytes', 'bool'],
//           [this.wallet, amountIn, 0, path, false],
//         ),
//       ];
//       const inpout2 =
//         '0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc100000x000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea0143000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000019ea32102d37704b00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000';

//       // const exactInputParams = ethers.utils.defaultAbiCoder.encode(
//       //   [
//       //     '(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum)',
//       //   ],
//       //   [
//       //     [
//       //       ethers.utils.solidityPack(
//       //         ['address', 'uint24', 'address'],
//       //         [this.WBNB_ADDRESS, 3000, this.CAKE_ADDRESS],
//       //       ),
//       //       this.wallet,
//       //       amountIn,
//       //       0,
//       //     ],
//       //   ],
//       // );

//       // const tokenContract = new ethers.Contract(
//       //   this.WBNB_ADDRESS,
//       //   [
//       //     'function approve(address spender, uint256 amount) external returns (bool)',
//       //   ],
//       //   wallet,
//       // );

//       // const approvalTx = await tokenContract.approve(
//       //   this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//       //   amountIn,
//       // );
//       // await approvalTx.wait();

//       const gasPrice = await provider.getGasPrice();
//       const tx = await router.execute(commands, [inpout2], deadline, {
//         value: amountIn,
//         gasPrice: gasPrice,
//         gasLimit: 300000,
//       });

//       console.log('Transaction submitted:', tx.hash);

//       const receipt = await tx.wait();
//       console.log('Swap executed successfully:', receipt);

//       // const cakeContract = new ethers.Contract(
//       //   this.CAKE_ADDRESS,
//       //   ['function balanceOf(address) view returns (uint256)'],
//       //   provider,
//       // );

//       // const balance = await cakeContract.balanceOf(this.wallet);
//       // console.log(
//       //   'CAKE balance after swap:',
//       //   ethers.utils.formatEther(balance),
//       // );
//     } catch (error) {
//       console.error('Error executing swap:', error);
//       throw error;
//     }
//   }

//   //   async exactInputSingleTrade() {
//   //     const ROUTER_ABI = [
//   //       'function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable returns (bytes[] outputs)',
//   //     ];

//   //     // Token Details
//   //     const TOKEN_IN = this.WBNB_ADDRESS; // Address of the token you're swapping from
//   //     const TOKEN_OUT = this.CAKE_ADDRESS; // Address of the token you're swapping to
//   //     const FEE_TIER = 3000; // Pool fee tier (0.3%)
//   //     const AMOUNT_IN = ethers.utils.parseUnits('0.001', 18); // 1 TOKEN_IN (adjust decimals)
//   //     const MINIMUM_AMOUNT_OUT = ethers.utils.parseUnits('0', 18); // Minimum acceptable TOKEN_OUT amount
//   //     const RECIPIENT = this.wallet; // Your wallet address
//   //     const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 20; // 10 minutes from now
//   //     const SQRT_PRICE_LIMIT_X96 = 0; // No price limit

//   //     const RPC_URL = this.RPC; // Binance Smart Chain RPC
//   //     const PRIVATE_KEY = this.private; // Your private key

//   //     const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
//   //     const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//   //     const router = new ethers.Contract(
//   //       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//   //       ROUTER_ABI,
//   //       wallet,
//   //     );
//   //     try {
//   //       const params = {
//   //         commands: '0x0b00',
//   //         inputs: [
//   //           '0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc100000x000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea0143000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000019ea32102d37704b00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000',
//   //         ],
//   //         deadline: DEADLINE,
//   //       };

//   //       // Get current gas price
//   //       const gasPrice = await provider.getGasPrice();

//   //       // Create transaction object
//   //       const txRequest = {
//   //         to: this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//   //         data: router.interface.encodeFunctionData('execute', [
//   //           params.commands,
//   //           params.inputs,
//   //           params.deadline,
//   //         ]),
//   //         value: ethers.utils.parseEther('0.001'),
//   //         from: wallet.address,
//   //         gasPrice: gasPrice,
//   //         gasLimit: '1000000',
//   //       };

//   //       // Estimate gas
//   //       //const estimatedGas = await provider.estimateGas(txRequest);
//   //       console.log('estimatedGas', txRequest);
//   //       // Add gas limit to transaction with 30% buffer
//   //       txRequest.gasLimit = '300000';

//   //       // Send transaction
//   //       const tx = await wallet.sendTransaction(txRequest);
//   //       console.log('Transaction submitted:', tx.hash);
//   //     } catch (error) {
//   //       console.error('Error executing trade:', error);
//   //     }
//   //   }

//   //   async swapExactInputSingle(
//   //     wallet: ethers.Wallet,
//   //     params: SwapParams,
//   //   ): Promise<ethers.ContractTransaction> {
//   //     const swapRouterContract = new ethers.Contract(
//   //       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//   //       ISwapRouter.abi as any,
//   //       wallet,
//   //     );

//   //     const tokenContract = new ethers.Contract(
//   //       params.tokenIn.address,
//   //       [
//   //         'function approve(address spender, uint256 amount) external returns (bool)',
//   //       ],
//   //       wallet,
//   //     );

//   //     const approvalTx = await tokenContract.approve(
//   //       this.PANCAKE_V3_SWAP_ROUTER_ADDRESS,
//   //       params.amountIn,
//   //     );
//   //     await approvalTx.wait();

//   //     const swapParams = {
//   //       tokenIn: params.tokenIn.address,
//   //       tokenOut: params.tokenOut.address,
//   //       fee: params.fee,
//   //       recipient: params.recipient,
//   //       deadline: params.deadline,
//   //       amountIn: params.amountIn,
//   //       amountOutMinimum: params.amountOutMinimum,
//   //       sqrtPriceLimitX96: params.sqrtPriceLimitX96,
//   //     };

//   //     const tx = await swapRouterContract.exactInputSingle(swapParams, {
//   //       gasLimit: '1000000',
//   //       value: ethers.utils.parseEther('0.001').toString(),
//   //     });

//   //     return tx;
//   //   }

//   //   async executeSwap() {
//   //     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//   //     const wallet = new ethers.Wallet(
//   //       '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449',
//   //       provider,
//   //     );

//   //     const WBNB = new Token(97, this.WBNB_ADDRESS, 18, 'WBNB', 'Wrapped BNB');

//   //     const CAKE = new Token(
//   //       97,
//   //       this.CAKE_ADDRESS,
//   //       18,
//   //       'CAKE',
//   //       'PancakeSwap Token',
//   //     );

//   //     const swapParams: SwapParams = {
//   //       tokenIn: WBNB,
//   //       tokenOut: CAKE,
//   //       fee: 2500,
//   //       recipient: '0xC1ad7E6c81113aD0C15ee6C3F8B7c19DCdEa0143',
//   //       deadline: Math.floor(Date.now() / 1000) + 60 * 20,
//   //       amountIn: ethers.utils.parseEther('0.001').toString(),
//   //       amountOutMinimum: '0',
//   //       sqrtPriceLimitX96: '0',
//   //     };
//   //     try {
//   //       const tx = await this.swapExactInputSingle(wallet, swapParams);
//   //       console.log('hash:', tx);
//   //       //     await tx.wait();
//   //       console.log('Swap ok');
//   //     } catch (error) {
//   //       console.error('Error:', error);
//   //     }
//   //   }

//   //   async executeSwap2(tokenIn: string, tokenOut: string, amountIn: string) {
//   //     const provider = new ethers.providers.JsonRpcProvider(this.RPC);
//   //     const wallet = new ethers.Wallet(
//   //       '0x146a158773ee3a8618c9920a63da5bc4cc22980ada99c8a13e6fd79367461449',
//   //       provider,
//   //     );
//   //     const router = new ethers.Contract(
//   //       '0xd77C2afeBf3dC665af07588BF798bd938968c72E',
//   //       [
//   //         'function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable returns (bytes[] outputs)',
//   //       ],
//   //       wallet,
//   //     );

//   //     try {
//   //       const commands = '0x0b00';
//   //       const swapParams = new ethers.utils.AbiCoder().encode(
//   //         [
//   //           '(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)',
//   //         ],
//   //         [
//   //           [
//   //             tokenIn,
//   //             tokenOut,
//   //             2500, // 0.25% fee
//   //             wallet.address,
//   //             ethers.utils.parseEther(amountIn),
//   //             0,
//   //             0,
//   //           ],
//   //         ],
//   //       );

//   //       const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10

//   //       const tx = await router.execute(
//   //         commands,
//   //         [
//   //           '0x000000000000000000000000ae13d989dac2f0debff460ac112a837c89baa7cd0000000000000000000000008d008b313c1d6c7fe2982f62d32da7507cf4355100000000000000000000000000000000000000000000000000000000000009c4000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea014300000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
//   //         ],
//   //         deadline,
//   //         {
//   //           gasLimit: 3000000,
//   //           value: ethers.utils.parseEther('0.001'),
//   //         },
//   //       );
//   //       return await tx.wait();
//   //     } catch (error) {
//   //       console.error('Swap execution failed:', error);
//   //       throw error;
//   //     }
//   //   }
// }


// decode
    // const a =
    //   '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000676010d600000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000c1ad7e6c81113ad0c15ee6c3f8b7c19dcdea0143000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000017fa5f91bf8f7a1900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bae13d989dac2f0debff460ac112a837c89baa7cd0009c48d008b313c1d6c7fe2982f62d32da7507cf43551000000000000000000000000000000000000000000';
    // const encodedParams32 = abiCoder.decode(['bytes', 'bytes[]', 'uint256'], a);
    // console.log(
    //   '🚀 ~ AppService ~ pancakeSwapV3 ~ encodedParams32:',
    //   encodedParams32.toString(),
    // );