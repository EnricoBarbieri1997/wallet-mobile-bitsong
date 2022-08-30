import { useCallback, useEffect, useMemo, useState } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { Observer, observer } from "mobx-react-lite"
import {
	FlatList,
	ListRenderItem,
	Platform,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	View,
} from "react-native"
import { RootStackParamList, RootTabParamList } from "types"
import { COLOR } from "utils"
import { Validator as ValidatorItem } from "components/organisms"
import { useGlobalBottomsheet, useStore } from "hooks"
import { Title, Toolbar } from "./components"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { Validator } from "core/types/coin/cosmos/Validator"
import { openClaim, openDelegateWithValidator } from "modals/validator"
import {
	openRedelegateWithValidator,
	openUndelegateWithValidator,
} from "modals/validator/withValidator"

type Props = CompositeScreenProps<
	NativeStackScreenProps<RootStackParamList>,
	BottomTabScreenProps<RootTabParamList, "ValidatorsList">
>

export default observer<Props>(function Stacking({ navigation }) {
	const { validators } = useStore()
	const gbs = useGlobalBottomsheet()

	const openClaimModal = (item: Validator) => {
		openClaim({
			amount: validators.validatorReward(item),
			coinName: "BTSG",
			onDone: () => {
				validators.claim(item)
			},
			navigation,
		})
	}

	const [isRefreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		await validators.update()
		setRefreshing(false)
	}, [])

	const openBottomSheet = useCallback(async (item) => {
		await gbs.setProps({
			snapPoints: [254],
			children: () => (
				<Toolbar
					style={{ marginHorizontal: 30 }}
					onPressClaim={
						validators.CanStake && validators.validatorReward(item) > 0 ?
						(() => {openClaimModal(item)})
						: undefined
					}
					onPressStake={
						validators.CanStake ?
						() => {openDelegateWithValidator(item, navigation)}
						: undefined
					}
					onPressUnstake={
						validators.CanStake && validators.validatorDelegations(item) > 0 ?
						() => (openUndelegateWithValidator(item, navigation))
						: undefined
					}
					onPressRestake={
						validators.CanStake && validators.validatorDelegations(item) > 0 ?
						() => (openRedelegateWithValidator(item, navigation))
						: undefined
					}
				/>
			),
		})
		gbs.snapToIndex(0)
	}, [validators.CanStake])

	const navToValidator = useCallback((id: string) => navigation.navigate("Validator", { id }), [])

	const renderValidators = useCallback<ListRenderItem<string>>(({ item }) => {
		return (
			<TouchableOpacity key={item} onPress={() => navToValidator(item)}>
				<ValidatorItem id={item} onPressKebab={openBottomSheet} />
			</TouchableOpacity>
		)
	}, [])

	return (
		<>
			<StatusBar style="light" />

			<SafeAreaView style={styles.container}>
				<FlatList
					ListHeaderComponent={<Title style={styles.title}>Validators</Title>}
					refreshControl={
						<RefreshControl
							tintColor={COLOR.White}
							refreshing={isRefreshing}
							onRefresh={onRefresh}
						/>
					}
					//
					keyExtractor={(item) => item}
					data={validators.validatorsIds}
					// data={["1", "2", "3", "4"]}
					renderItem={renderValidators}
					//
					style={styles.flatlist}
					contentContainerStyle={styles.flatlistContent}
				/>
			</SafeAreaView>
		</>
	)
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLOR.Dark3,
	},

	flatlist: {
		backgroundColor: "red",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 130 : 160,
	},
	title: {
		// marginTop: Platform.OS === "ios" ? 30 : 60,
		marginBottom: 24,
	},
	flatlistContent: {
		paddingHorizontal: 30,
	},
})
