import CustomText from "@components/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { FC } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "src/context/ThemeContext";
import { isTablet } from "src/utils/Constants";

type SubmitCancelButtonsProps = {
    cancelHandler: () => void;
    cancelText: string;
    submitHandler?: () => Promise<void>;
    submitText?: string;
    disabledSubmit?: boolean,
    disabledCancel?: boolean
}
const SubmitCancelButtons: FC<SubmitCancelButtonsProps> = ({ cancelHandler, cancelText, submitHandler, submitText, disabledSubmit, disabledCancel }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <TouchableOpacity disabled={disabledCancel} style={[styles.buttonContainer, { borderColor: disabledCancel ? 'lightgray' : theme.colors.default }]} onPress={cancelHandler}>
                <CustomText style={[styles.buttonText, { paddingVertical: 10, color: disabledCancel ? 'lightgray' : theme.colors.default }]}>{cancelText}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderRadius: 10, width: '45%' }} disabled={disabledSubmit} onPress={submitHandler}>
                <LinearGradient
                    colors={[disabledSubmit ? 'lightgray' : theme.colors.buttonGradient1, disabledSubmit ? 'lightgray' : theme.colors.buttonGradient2,]} style={[{ borderRadius: 10, paddingVertical: isTablet ? 5 : 0, borderWidth: 1, borderColor: 'transparent' }]}>
                    <CustomText style={[styles.buttonText, { color: '#fff', paddingVertical: 10 }]}>{submitText}</CustomText>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-around',
        alignSelf: 'center',
        width: "100%"
    },
    buttonContainer: {
        borderWidth: 1,
        borderRadius: 10,
        width: '45%',
        paddingVertical: isTablet ? 5 : 0,
    },
    buttonText: {
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.SemiBold,
        textAlign: "center",
    },
});

export default SubmitCancelButtons;