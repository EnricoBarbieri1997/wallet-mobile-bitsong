import { useCallback, useMemo } from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { RectButton, Swipeable } from "react-native-gesture-handler"
import { BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { observable } from "mobx"
import { observer } from "mobx-react-lite"
import { useStore } from "hooks"
import { COLOR, hexAlpha } from "utils"
import { Button, Icon2 } from "components/atoms"
import { Search, Title } from "../atoms"
import { Phrase as PhraseView } from "components/moleculs"
import * as Clipboard from "expo-clipboard"
import { WalletItemEdited } from "../moleculs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ProfileWallets } from "stores/WalletStore"
import { WalletTypes } from "core/types/storing/Generic"
import { ListButton } from "screens/Profile/components/atoms"
import { ControllerChangeWallet } from "../../controllers"

type Props = {
	close(): void
	controller: ControllerChangeWallet
	onPressViewMnemonic(): void
}

export default observer<Props>(({ close, controller, onPressViewMnemonic }) => {
	const { wallet } = useStore()
	const {
		steps,
		edited,
		inputSearch,
		inputWalletName,
		selected,
		setEdited,
		setSelected,
		seedPhrase,
	} = controller

	const filtred = useMemo(() => {
		if (inputSearch.value) {
			const lowerCase = inputSearch.value.toLowerCase()
			return wallet.wallets.filter(({ profile }) => profile.name?.toLowerCase().includes(lowerCase))
		} else {
			return wallet.wallets
		}
	}, [inputSearch.value, wallet.wallets])

	const removeEdited = useCallback(() => setEdited(null), [])

	// ------- FlatList ----------

	const mapItemsRef = useMemo(
		() => observable.map<ProfileWallets, React.RefObject<Swipeable>>(),
		[],
	)

	const keyExtractor = ({ profile }: ProfileWallets) => profile.name
	const renderWallets = useCallback(
		({ item }) => (
			<View style={{ marginBottom: 13 }}>
				<WalletItemEdited
					value={item}
					isActive={selected === item}
					onPress={setSelected}
					onPressDelete={(w) => {
						close()
						wallet.deleteProfile(w)
					}}
					onPressEdit={(profile) => {
						setEdited(profile)
					}}
					mapItemsRef={mapItemsRef}
				/>
			</View>
		),
		[selected],
	)

	return (
		<View style={styles.container}>
			{steps.active === 0 && (
				<>
					<View style={styles.wrapper}>
						<View style={styles.header}>
							<View style={styles.headerCenter}>
								<Title style={styles.title}>Seleziona Wallet</Title>
							</View>
						</View>
						<Search
							placeholder="Cerca Wallet"
							style={styles.search}
							value={inputSearch.value}
							onChangeText={inputSearch.set}
						/>
					</View>

					{/* <View style={[styles.switchContainer, styles.wrapper]}>
                  <Text style={styles.switchTitle}>Tutti</Text>
                  <Switch gradient />
                </View> */}

					<BottomSheetFlatList
						data={filtred}
						keyExtractor={keyExtractor}
						renderItem={renderWallets}
						style={styles.scroll}
						contentContainerStyle={styles.scrollContent}
					/>
				</>
			)}
			{steps.active === 1 && (
				<View style={styles.wrapper}>
					<View style={styles.header}>
						<View style={styles.headerLeft}>
							<RectButton
								style={styles.buttonBack}
								onPress={() => {
									removeEdited()
									steps.goBack()
								}}
							>
								<Icon2 size={24} name="arrow_left" stroke={COLOR.White} />
							</RectButton>
						</View>

						<View style={styles.headerCenter}>
							<Title style={styles.title}>Edit Wallet</Title>
						</View>
						<View style={styles.headerRight} />
					</View>
					<Search
						placeholder="Cerca Wallet"
						style={styles.search}
						value={inputWalletName.value}
						onChangeText={inputWalletName.set}
						loupe={false}
					/>
					<View style={styles.editMenu}>
						<Text style={styles.editTitle}>Safety</Text>
						<View style={styles.buttons_list}>
							{edited?.profile.type == WalletTypes.COSMOS && (
								<ListButton
									style={styles.listButton}
									icon="eye"
									text="View Mnemonics"
									arrow
									onPress={onPressViewMnemonic}
								/>
							)}
							<ListButton
								style={styles.listButton}
								icon="power"
								text="Disconnect Wallet"
								arrow
								onPress={() => edited && wallet.deleteProfile(edited)}
							/>
						</View>

						<Text style={styles.caption}>
							Access VIP experiences, exclusive previews,{"\n"}
							finance your own and have your say.
						</Text>
					</View>
				</View>
			)}

			{steps.active === 2 && (
				<View style={[styles.wrapper, { flex: 1 }]}>
					<View style={styles.header}>
						<View style={styles.headerLeft}>
							<RectButton
								style={styles.buttonBack}
								onPress={() => {
									steps.goBack()
									controller.setPhrase([])
								}}
							>
								<Icon2 size={24} name="arrow_left" stroke={COLOR.White} />
							</RectButton>
						</View>

						<View style={styles.headerCenter}>
							<Title style={styles.title}>View Mnemonic Seed</Title>
						</View>
						<View style={styles.headerRight} />
					</View>

					<BottomSheetScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{ paddingBottom: 116, paddingTop: 10 }}
					>
						<PhraseView style={styles.phrase} hidden={false} value={seedPhrase} />
					</BottomSheetScrollView>
				</View>
			)}
		</View>
	)
})

type FooterProps = {
	onPressSelect(): void
	onPressSave(): void
	controller: ControllerChangeWallet
}

export const Footer = observer<FooterProps>(({ onPressSave, onPressSelect, controller }) => {
	const insent = useSafeAreaInsets()
	const copyToClipboard = useCallback(async () => {
		await Clipboard.setStringAsync(controller.seedPhrase.join(" "))
	}, [])
	return (
		<View style={[styles.buttons, { bottom: insent.bottom }]}>
			{controller.steps.active === 0 && (
				<Button
					text="Select"
					onPress={onPressSelect}
					textStyle={styles.buttonText}
					contentContainerStyle={styles.buttonContent}
				/>
			)}
			{controller.steps.active === 1 && (
				<Button
					text="Save"
					onPress={onPressSave}
					textStyle={styles.buttonText}
					contentContainerStyle={styles.buttonContent}
				/>
			)}
			{controller.steps.active === 2 && (
				<TouchableOpacity onPress={copyToClipboard}>
					<Text style={[styles.editTitle, { color: COLOR.White }]}>Copy to Clipboard</Text>
				</TouchableOpacity>
			)}
		</View>
	)
})

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		height: Dimensions.get("screen").height * 0.9,
		marginTop: 15,
	},
	wrapper: { marginHorizontal: 26 },

	// ------ Header ---------
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 30,
	},
	headerRight: { flex: 1 },
	headerCenter: {
		flex: 2,
		alignItems: "center",
	},
	headerLeft: {
		flex: 1,
		flexDirection: "row",
	},

	buttonBack: { padding: 5 },
	title: { fontSize: 16 },
	search: { marginBottom: 9 },

	// ------  Edit --------

	editMenu: { marginTop: 40 },
	editTitle: {
		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 20,

		color: hexAlpha(COLOR.White, 50),
	},

	buttons_list: {
		marginRight: 15,
		paddingTop: 15,
	},
	listButton: { marginBottom: 5 },

	caption: {
		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 18,

		color: hexAlpha(COLOR.White, 30),
		textAlign: "center",

		marginTop: 40,
	},

	// ----- Wallets -------
	switchContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",

		marginTop: 32,
		marginBottom: 9,
	},
	switchTitle: {
		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: 12,
		lineHeight: 15,

		color: COLOR.White,
		marginRight: 11,
	},

	scroll: {
		flexGrow: 1,
	},
	scrollContent: {
		paddingTop: 9,
		paddingBottom: 50,
	},

	phrase: {
		alignItems: "center",
	},

	// ------- Buttons ------

	buttons: {
		padding: 15,
		flexDirection: "row",
		justifyContent: "center",
		position: "absolute",
		width: "100%",
	},
	buttonText: {
		fontSize: 14,
		lineHeight: 18,
	},
	buttonContent: {
		paddingVertical: 18,
		paddingHorizontal: 40,
	},
})
