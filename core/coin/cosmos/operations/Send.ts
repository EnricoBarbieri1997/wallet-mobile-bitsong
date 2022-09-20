import { assertIsDeliverTxSuccess, GasPrice, SigningStargateClient } from "@cosmjs-rn/stargate";
import { FromToAmount } from "core/types/coin/cosmos/FromToAmount";
import { Denom, Operation } from "core/types/coin/Generic";
import { CosmosOperation } from "./CosmosOperation";

export class Send extends CosmosOperation {
	async Run(data: FromToAmount) {
		const wallet = await data.from.Signer()
		const [firstAccount] = await wallet.getAccounts();
		const client = await SigningStargateClient.connectWithSigner(this.coin.RPCEndpoint(), wallet, {
			gasPrice: GasPrice.fromString(this.coin.gasUnit()),
		})

		try
		{
			const amount = Array.isArray(data.amount) ? data.amount : [data.amount]
			const result = await client.sendTokens(firstAccount.address, await data.to.Address(), amount, "auto", data.description)
			assertIsDeliverTxSuccess(result)
			return {
				hash: result.transactionHash
			}
		}
		catch(e)
		{
			console.error("Catched", e)
		}
		return false
	}
}