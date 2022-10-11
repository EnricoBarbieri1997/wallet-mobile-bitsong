import { useCallback } from "react"
import {
	GestureResponderEvent,
	StyleProp,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
	ViewStyle,
} from "react-native"
import { s } from "react-native-size-matters"
import { COLOR, hexAlpha } from "utils"

type Props = {
	text?: string
	index?: number
	style?: StyleProp<ViewStyle>
	hidden?: boolean
	hiddenStyle?: StyleProp<ViewStyle>

	onPress?(text: string): void
	isActive?: boolean
}

export default ({ index, text, style, hidden, hiddenStyle, onPress, isActive }: Props) => {
	const handlePress = useCallback(
		(e: GestureResponderEvent) => {
			e.preventDefault()
			text && onPress && onPress(text)
		},
		[text, onPress],
	)
	return (
		<TouchableWithoutFeedback onPress={handlePress}>
			<View
				style={[
					styles.container,
					hidden && styles.containerHidden,
					isActive && styles.containerHidden,
					hidden && hiddenStyle,
					style,
				]}
			>
				<Text style={[styles.index, hidden && styles.hidden]}>{index}.</Text>
				<Text style={[styles.text, hidden && styles.hidden]}>{text}</Text>
			</View>
		</TouchableWithoutFeedback>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLOR.Dark3,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: s(20),
		paddingVertical: s(11),
		borderRadius: s(50),
	},
	containerHidden: {
		backgroundColor: COLOR.Dark2,
	},
	hidden: {
		color: "transparent",
	},
	index: {
		fontFamily: "CircularStd",
		color: hexAlpha(COLOR.White, 40),
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: s(18),
		lineHeight: s(23),
		marginRight: s(6),
	},
	text: {
		fontFamily: "CircularStd",
		color: COLOR.White,
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: s(16),
		lineHeight: s(20),
	},
})
