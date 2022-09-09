import { SupportedCoins } from "constants/Coins"
import { gbs } from "modals"
import { navigate } from "navigation/utils"
import { Keyboard, StyleProp, ViewStyle } from "react-native"
import { SendController } from "./controllers"
import { SendModal } from "./modals"
import { store } from "stores/Store"
import { toJS } from "mobx"
import { wait } from "utils"

export default function openSendModal(style: StyleProp<ViewStyle>) {
	const { coin } = store
	const controller = new SendController()
	const { creater, steps } = controller
	creater.setCoin(coin.findAssetWithCoin(SupportedCoins.BITSONG) ?? coin.coins[0])

	const scanReciver = async () => {
		await gbs.close()
		navigate("ScannerQR", {
			onBarCodeScanned: async (result) => controller.creater.addressInput.set(result),
			onClose: open,
		})
	}

	const send = () => {
		const { coin, addressInput, balance } = creater
		if (store.coin.hasCoins && coin && addressInput && balance) {
			navigate("Loader", {
				// @ts-ignore
				callback: async () => {
					// await wait(2000) // for example
					// return true
					return await store.coin.sendCoin(coin.info.coin, addressInput.value, balance)
				},
			})
		}
		close()
	}

	const close = () => {
		Keyboard.dismiss()
		gbs.close()
		controller.clear()
	}

	const goBack = () => (steps.active > 0 ? steps.goBack() : close())

	const open = async () => {
		gbs.backHandler = goBack

		await gbs.setProps({
			snapPoints: ["85%"],
			$modal: true,
			keyboardBehavior: "fillParent",
			children: () => (
				<SendModal
					close={close}
					controller={controller}
					onPressScanQRReciver={scanReciver}
					onPressSend={send}
					onPressBack={goBack}
				/>
			),
		})

		requestAnimationFrame(() => gbs.expand())
	}

	coin.CanSend && open()
}
