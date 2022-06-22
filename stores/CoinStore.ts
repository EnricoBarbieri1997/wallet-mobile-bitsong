import { Coin } from "classes";
import mock from "classes/mock";
import { ICoin } from "classes/types";
import { CoinClasses, SupportedCoins } from "constants/Coins";
import { PublicWallet } from "core/storing/Generic";
import { CosmosWallet } from "core/storing/Wallet";
import { FromToAmount } from "core/types/coin/cosmos/FromToAmount";
import { Amount, Denom } from "core/types/coin/Generic";
import { CoinOperationEnum } from "core/types/coin/OperationTypes";
import { WalletData } from "core/types/storing/Generic";
import { autorun, keys, makeAutoObservable, runInAction, values } from "mobx";
import { round } from "utils";
import RemoteConfigsStore from "./RemoteConfigsStore";
import WalletStore, { StoreWallet } from "./WalletStore";

export default class CoinStore {
	coins: Coin[] = []
	loading = {
		balance: false,
		send: false,
	}
	results: {
		balance: boolean | null,
		send: boolean | null,
	} = {
		balance: null,
		send: null,
	}
	constructor(private walletStore: WalletStore, private remoteConfigs: RemoteConfigsStore) {
		makeAutoObservable(this, {}, { autoBind: true });
		autorun(() => {this.updateBalances()})
	}

	async updateBalances()
	{
		runInAction(() =>
		{
			this.loading.balance = true
			this.results.balance = null
		})
		const coins:Coin[] = []
		const balanceAwaits = [] 
		const infos:ICoin[] = [] 
		const coinRates:number[] = [] 
		for(const chain of this.remoteConfigs.enabledCoins)
		{
			const coin = CoinClasses[chain]
			const info = Object.assign({}, mock[chain])
			try
			{
				if(this.walletStore.activeWallet)
				{
					const walletValues = values(this.walletStore.activeWallet as StoreWallet)
					const data = walletValues[0] as WalletData
					info.address = data.metadata.addresses[chain]
					balanceAwaits.push(coin.Do(CoinOperationEnum.Balance, {
						wallet: new PublicWallet(info.address)
					}))
					infos.push(info)
					coinRates.push()
				}
			}
			catch(e) {
				console.log(e)
			}
		}
		let errors = false
		try
		{
			const balances = await Promise.all(balanceAwaits)
			balances.forEach((balance:Amount[], i) =>
			{
				if(balance)
				{
					balance.forEach(asset => {
						infos[i].balance = this.fromAmountToCoin(asset)
						coins.push(new Coin(infos[i], this.fromDenomToPrice(asset.denom)))
					})
				}
				else
				{
					errors = true
				}
			})
			runInAction(() =>
			{
				this.coins.splice(0, this.coins.length, ...coins)
				this.loading.balance = false
				this.results.balance = errors
			})
		}
		catch(e)
		{
			console.log(e)
		}
	}

	get totalBalance()
	{
	  return round(
		this.coins.reduce(
		  (total, coin) => (coin.balanceUSD ? coin.balanceUSD + total : total),
		  0
		)
	  )
	}

	async send(coin: SupportedCoins, address: string, dollar:number)
	{
		runInAction(() =>
		{
			this.results.send = null
			this.loading.send = true
		})
		if(!(this.walletStore.activeWallet && this.walletStore.activeWallet.wallets[coin])) return
		const coinClass = CoinClasses[coin]
		try
		{
			const wallet = this.walletStore.activeWallet.wallets[coin]
			if(!(wallet instanceof CosmosWallet))
			{
				runInAction(() =>
				{
					this.loading.send = false
					this.results.send = false
				})
				return
			}
			const data: FromToAmount = {
				from:  wallet as CosmosWallet,
				to: new PublicWallet(address),
				amount: this.fromDollarsToAmount(dollar, coinClass.coin.denom()),
			}
			const res = await coinClass.Do(CoinOperationEnum.Send, data)
			runInAction(() =>
			{
				this.loading.send = false
				this.results.send = res
			})
			this.updateBalances()
		}
		catch(e)
		{
			console.log(e)
		}
	}

	convertRateFromDenom(denom: Denom)
	{
		switch(denom)
		{
			default:
				return 1000000
		}
	}

	fromAmountToCoin(amount: Amount)
	{
		return Number(amount.amount) / this.convertRateFromDenom(amount.denom)
	}

	fromDenomToPrice(denom: Denom)
	{
		const prices = this.remoteConfigs.prices

		switch(denom)
		{
			default:
				return prices.bitsong
		}
	}

	fromAmountToDollars(amount: Amount)
	{
		return this.fromAmountToCoin(amount) * this.fromDenomToPrice(amount.denom)
	}

	fromDollarsToAmount(dollars: number, denom: Denom): Amount
	{
		return {
			amount: Math.round(dollars / this.fromDenomToPrice(denom) * this.convertRateFromDenom(denom)).toString(),
			denom,
		}
	}
}