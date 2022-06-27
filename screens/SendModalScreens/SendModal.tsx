import { useCallback, useEffect, useMemo } from "react";
import {
  BackHandler,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { observer } from "mobx-react-lite";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useStore } from "hooks";
import { RootStackParamList, RootTabParamList } from "types";
import { Pagination } from "components/moleculs";
import { SendController } from "./classes";
import { Header } from "./components/atoms";
import { Header as BottomTabHeader } from "components/organisms";
import {
  InsertImport,
  SendRecap,
  SelectReceiver,
  SelectCoin,
} from "./components/templates";

type Props = {
  style?: StyleProp<ViewStyle>;
  close(): void;
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList, "MainTab">,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default observer<Props>(function SendModal({
  style,
  close,
  navigation,
}) {
  const store = useStore();

  const controller = useMemo(
    () => new SendController(store.coin.coins[0]),
    [store]
  );
  const { steps, creater } = controller;

  const goBack = useCallback(
    () => (steps.title === "Insert Import" ? close() : steps.goBack()),
    [steps, close]
  );
  const send = () => {
    const { coin, addressInput, amount } = controller.creater;
    if (coin) {
      navigation.push("Loader", {
        // @ts-ignore
        header: BottomTabHeader,
        callback: async () => {
          // await wait(2000); // for example
          await store.coin.send(coin.info.coin, addressInput.value, amount);
        },
      });
    }
    close();
  };

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => handler.remove();
  }, [goBack]);

  const onPressScanner = useCallback(
    () =>
      navigation.push("ScannerQR", {
        onBarCodeScanned: creater.addressInput.set,
      }),
    [navigation, creater]
  );
  // --------- Header --------------
  const isShowHeader = steps.title !== "Select coin";

  const title = useMemo(
    () => (steps.title === "Send Recap" ? steps.title : "Send"),
    [steps.title]
  );
  const subtitle = useMemo(
    () => (steps.title !== "Send Recap" ? steps.title : undefined),
    [steps.title]
  );
  // =======================

  return (
    <BottomSheetView style={[styles.container]}>
      <View style={styles.wrapper}>
        {isShowHeader && (
          <Header
            title={title}
            subtitle={subtitle}
            Pagination={<Pagination acitveIndex={steps.active} count={3} />}
            style={styles.header}
          />
        )}

        {steps.title === "Insert Import" && (
          <InsertImport
            controller={controller}
            onPressNext={() => steps.goTo("Select Receiver")}
            onPressBack={close}
            onPressSelectCoin={() => steps.goTo("Select coin")}
          />
        )}
        {steps.title === "Select Receiver" && (
          <SelectReceiver
            controller={controller}
            onPressBack={goBack}
            onPressRecap={() => steps.goTo("Send Recap")}
            onPressScanner={onPressScanner}
          />
        )}
        {steps.title === "Send Recap" && (
          <SendRecap
            controller={controller}
            onPressBack={goBack}
            onPressSend={send}
          />
        )}
        {steps.title === "Select coin" && (
          <SelectCoin controller={controller} onBack={goBack} />
        )}
      </View>
    </BottomSheetView>
  );
});

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  wrapper: {
    marginHorizontal: 30,
    flex: 1,
  },
  header: { marginTop: 10 },
});
