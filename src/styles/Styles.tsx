import { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const useGlobalStyles = () => {
  const { theme } = useTheme();

  return useMemo(() => StyleSheet.create({
    whiteContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#fff",
    },
    isLoading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.5,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center'
    },
    sectionView: {
      backgroundColor: '#fff',
      borderRadius: 5,
      borderCurve: 'continuous',
      padding: 10,
      marginHorizontal: 5,
      marginVertical: 5
    },
    justifiedRow: {
      flexDirection: "row",
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    justifiedColumn: {
      flexDirection: "column",
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    shadow: {
      backgroundColor: '#fff',
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
      boxShadow: Platform.OS === 'android' ? `0px 2px 4px 0px rgba(0, 0, 0, 0.1)` : undefined,
    },
    cardView: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'lightgray',
      borderRadius: 15,
      paddingVertical: 10,
      paddingHorizontal: 5,
      marginBottom: 10
    },
    noDataView: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1
    },
    noData: {
      fontSize: theme.fontSize.large,
      color: theme.colors.grayDark,
      marginTop: 10
    },
    bottomBtnView: {
      backgroundColor: '#fff',
      padding: 10,
      paddingHorizontal: 15,
      borderColor: 'lightgray',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      shadowOpacity: 0.25,
      boxShadow: Platform.OS === 'android' ? `0px -5px 5px rgba(0, 0, 0, 0.1)` : undefined,
      borderTopWidth: StyleSheet.hairlineWidth,
    }
  }), [theme]);
};