import { useMemo } from "react"
import {
	StyleProp,
	StyleSheet,
	Text,
	TextInputProps,
	TextStyle,
	View,
	ViewStyle,
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { useTheme } from "hooks"
import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { COLOR } from "utils"
import { s } from "react-native-size-matters"

export type Props = TextInputProps & {
	label?: string
	style?: StyleProp<ViewStyle>
	inputStyle?: StyleProp<TextStyle>
	autocomplete?: string | null
	bottomsheet?: boolean
	Right?: JSX.Element

	errorMessage?: string | string[] | false
	errorStyle?: StyleProp<ViewStyle>
}

const HEIGHT = s(62)
const LINE_HEIGHT = s(18)
const BORDER_RADIUS = s(20)

export default ({
	label,
	inputStyle,
	style,
	autocomplete,
	bottomsheet,
	Right,
	errorMessage,
	errorStyle,
	...props
}: Props) => {
	const theme = useTheme()
	const Component = useMemo(() => (bottomsheet ? BottomSheetTextInput : TextInput), [bottomsheet])

	const autocompletePosition = useMemo(
		() =>
			inputStyle?.height
				? {
						top: inputStyle?.height / 2 - LINE_HEIGHT / 2,
				  }
				: undefined,
		[inputStyle?.height],
	)

	const errorBorder = useMemo<false | ViewStyle>(
		() =>
			!!errorMessage && {
				borderWidth: 1,
				borderColor: COLOR.Pink3,
			},
		[errorMessage],
	)

	const errorText = useMemo(
		() => (Array.isArray(errorMessage) ? errorMessage[0] : errorMessage),
		[errorMessage],
	)

	return (
		<View style={styles.w100}>
			{label &&
			<Text style={styles.label}>
				{label}
			</Text>}
			<View style={[styles.container, theme.input.container, style, errorBorder]}>
				{autocomplete && (
					<Text style={[theme.input.autocomplete, styles.autocomplete, autocompletePosition]}>
						{autocomplete}
					</Text>
				)}

				<View style={[styles.row, styles.w100]}>
					<Component
						style={[theme.input.component, styles.input, inputStyle]}
						placeholderTextColor={theme.input.placeholder}
						{...props}
					/>
					{Right}
				</View>

				{errorText && <ErrorMessage message={errorText} style={errorStyle} />}
			</View>
		</View>
	)
}

type ErrorProps = {
	message: string
	style?: StyleProp<ViewStyle>
}

const ErrorMessage = ({ message, style }: ErrorProps) => (
	<Text style={[styles.error, style]}>{message}</Text>
)

const styles = StyleSheet.create({
	w100: {
		width: "100%",
	},
	container: {
		borderRadius: BORDER_RADIUS,
		width: "100%",
	},
	row: {
		flexDirection: "row",
		overflow: "hidden",
	},
	label: {
		fontFamily: "CircularStd",
		fontWeight: "400",
		fontSize: s(12),
		color: COLOR.Marengo,
		marginBottom: s(12),
	},
	input: {
		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "400",
		fontSize: s(14),
		// https://stackoverflow.com/a/68458803
		paddingHorizontal: s(24),
		paddingVertical: s(19),
		height: HEIGHT,
		flex: 1,
	},
	autocomplete: {
		position: "absolute",
		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "400",
		fontSize: s(14),
		lineHeight: LINE_HEIGHT,
		top: s(19),
		left: s(25),
	},

	error: {
		position: "absolute",
		bottom: s(-19),
		left: s(24),

		fontFamily: "CircularStd",
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: s(12),
		lineHeight: s(15),

		color: COLOR.Pink2,
	},
})
