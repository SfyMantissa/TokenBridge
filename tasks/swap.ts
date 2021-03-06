import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import config from '../config';

task("swap",
  "Initiate the swap of ERC20 token between 2 blockchains.")
  .addParam("signer", "ID of the signer used to make the call.")
  .addParam("recepient", "The recepient's address.")
  .addParam("amount", "The amount of ERC20 tokens to be swapped.")
  .setAction(async (args, { ethers }) => {

    let bridgeAddress: string;
    const network = await ethers.provider.getNetwork();
    const signerArray = await ethers.getSigners();

    if (network.chainId === 4) {
      bridgeAddress = config.BRIDGE_RINKEBY_ADDRESS;
    } else if (network.chainId === 97) {
      bridgeAddress = config.BRIDGE_BNBT_ADDRESS;
    } else {
      throw "ERROR: Network must be Rinkeby or BNBT."
    }

    const Bridge = await ethers.getContractFactory("Bridge");
    const bridge = Bridge.attach(bridgeAddress);

    const txSwap = bridge.connect(signerArray[args.signer]).swap(
      args.recepient,
      args.amount
    );

    const rSwap = await (await txSwap).wait();

    const sender = rSwap.events[1].args[0];
    const recepient = rSwap.events[1].args[1];
    const amount = rSwap.events[1].args[2];
    const nonce = rSwap.events[1].args[3];

    console.log("Initiated the swap from " + network.name.toUpperCase()
      + " of " + amount + " YAC tokens by user " + sender + " to user "
      + recepient + ".\n" + "Nonce is " + nonce + ".");

  });
