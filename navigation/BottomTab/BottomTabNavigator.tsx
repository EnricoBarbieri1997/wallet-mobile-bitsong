import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { RootTabParamList } from "types"
import * as Screens from "screens"
import { Icon2 } from "components/atoms"
import { MainTabBar } from "./components"
import { COLOR, hexAlpha } from "utils"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Header } from "components/organisms"
import { View } from "react-native"
import MarkerSoon from "./components/MarkerSoon"

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>()

function getStroke(focused: boolean) {
	return focused ? COLOR.White : hexAlpha(COLOR.White, 50)
}

export default () => (
	<BottomSheetModalProvider>
		<BottomTab.Navigator
			tabBar={(props) => <MainTabBar {...props} />}
			screenOptions={{
				header: (props) => <Header {...props} />,
				headerTransparent: true,
				tabBarStyle: { position: "absolute" },
				tabBarShowLabel: false,
			}}
		>
			<BottomTab.Screen
				name="MainTab"
				component={Screens.Main}
				options={() => ({
					tabBarIcon: ({ focused }) => <Icon2 name="home" size={20} stroke={getStroke(focused)} />,
				})}
			/>
			<BottomTab.Screen
				name="ValidatorsList"
				component={Screens.ValidatorsList}
				options={{
					tabBarIcon: ({ focused }) => (
						<View>
							<Icon2 name="stake" size={20} stroke={hexAlpha(COLOR.White, 10)} />
						</View>
					),
				}}
				listeners={{ tabPress: (e) => e.preventDefault() }}
			/>
			<BottomTab.Screen
				name="Proposal"
				component={Screens.Proposal}
				options={() => ({
					tabBarIcon: ({ focused }) => (
						<View>
							<Icon2 name="like" size={20} stroke={hexAlpha(COLOR.White, 10)} />
						</View>
					),
				})}
				listeners={{ tabPress: (e) => e.preventDefault() }}
			/>
			<BottomTab.Screen
				name="Tab2"
				component={Screens.Main}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<View>
							<Icon2 name="circle" size={20} stroke={hexAlpha(COLOR.White, 10)} />
							<MarkerSoon />
						</View>
					),
				}}
				listeners={{ tabPress: (e) => e.preventDefault() }}
			/>
		</BottomTab.Navigator>
	</BottomSheetModalProvider>
)
