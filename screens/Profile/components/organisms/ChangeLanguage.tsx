import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ListRenderItem,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { observer } from "mobx-react-lite";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useStore } from "hooks";
import { InputHandler } from "utils";
import { Search, Title } from "../atoms";
import { LanguageItem } from "../moleculs";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheet } from "components/moleculs";
import { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "components/atoms";
import languages from "constants/languages";
import { ILang } from "screens/Profile/type";
import useBottomSheetBackButton from "screens/Profile/hooks/useBottomSheetBackButton";

type Props = {
  isOpen?: boolean;
  animatedPosition?: SharedValue<number>;
  backgroundStyle: StyleProp<
    Omit<ViewStyle, "bottom" | "left" | "position" | "right" | "top">
  >;
  onClose?(): void;
};

export default observer<Props>(
  ({ backgroundStyle, animatedPosition, isOpen, onClose }) => {
    const { settings } = useStore();

    // ------ BottomSheet -------

    const snapPoints = useMemo(() => ["95%"], []);
    const bottomSheet = useRef<BottomSheetMethods>(null);

    const close = () => bottomSheet.current?.close();
    const open = () => bottomSheet.current?.snapToIndex(0);

    useEffect(() => (isOpen ? open() : close()), [isOpen]);

    // --------- Search ---------
    const input = useMemo(() => new InputHandler(), []);

    const filtred = useMemo(() => {
      if (input.value) {
        const lowerCase = input.value.toLowerCase();
        return languages.filter(({ name }) =>
          name.toLowerCase().includes(lowerCase)
        );
      } else {
        return languages;
      }
    }, [input.value]);

    // ------- FlatList ----------

    const setLanguage = useCallback((lang: ILang) => {
      settings.setLanguage(lang);
      close();
    }, []);

    const keyExtractor = ({ id }: ILang) => id;
    const renderLanguage = useCallback<ListRenderItem<ILang>>(
      ({ item }) => (
        <LanguageItem
          value={item}
          isActive={item.id === settings.language.id}
          onPress={setLanguage}
        />
      ),
      [settings.language]
    );

    // --------- Close -----------

    const handleClose = useCallback(() => onClose && onClose(), [onClose]);
    useBottomSheetBackButton(isOpen, handleClose);

    return (
      <BottomSheet
        enablePanDownToClose
        snapPoints={snapPoints}
        ref={bottomSheet}
        backgroundStyle={backgroundStyle}
        animatedPosition={animatedPosition}
        onClose={handleClose}
        onAnimate={handleAnimate}
        index={-1}
      >
        <View style={styles.container}>
          <Title style={styles.title}>Seleziona Lingua</Title>
          <Search
            placeholder="Cerca Lingua"
            style={styles.search}
            value={input.value}
            onChangeText={input.set}
          />
          <BottomSheetFlatList
            data={filtred}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyExtractor={keyExtractor}
            renderItem={renderLanguage}
          />
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: Dimensions.get("screen").height * 0.9,
    marginTop: 15,
    marginHorizontal: 26,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,

    marginBottom: 30,
    textAlign: "center",
  },
  search: {
    marginBottom: 9,
  },

  scroll: {
    height: 100,
    flexGrow: 1,
  },
  scrollContent: {
    paddingTop: 9,
    paddingBottom: 50,
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
    paddingHorizontal: 53,
  },
});
