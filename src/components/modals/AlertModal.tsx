import CustomText from "@components/CustomText";
import ModalHeader from "@components/molecules/ModalHeader";
import { Octicons } from "@expo/vector-icons";
import { FC } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "src/context/ThemeContext";
import SubmitCancelButtons from "../molecules/SubmitCancelButtons";

type Props = {
    closeModal: () => void,
    heading: string,
    description: string,
    onConfirm: () => void,
    alertText?: string,
    setAlertText?: (val: string) => void,
    disableSubmit?: boolean,
    cancelText?: string,
    submitText?: string
}

const AlertModal: FC<Props> = ({ closeModal, heading, description, onConfirm, alertText, setAlertText, disableSubmit, cancelText, submitText }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const submitHandler = async () => {
        !cancelText && closeModal();
        onConfirm();
    };

    return (
        <View style={{ paddingBottom: Platform.OS === 'android' ? 10 : 0 }}>
            <ModalHeader heading={heading} prefixIcon={heading === 'Logout' ? <Octicons name="sign-out" size={25} color={theme.colors.default} style={{ marginRight: 10 }} /> : null} />
            <View style={{ justifyContent: 'center', paddingHorizontal: 10, marginVertical: 25 }}>
                <CustomText style={{ fontSize: theme.fontSize.medium }}>{description}</CustomText>
            </View>
            <SubmitCancelButtons cancelHandler={closeModal} cancelText={cancelText ?? "Cancel"} submitHandler={submitHandler} submitText={submitText ?? "Confirm"} disabledSubmit={disableSubmit} />
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    versionText: {
        color: theme.colors.grayDark,
        textAlign: 'center',
        fontSize: theme.fontSize.small,
        marginTop: 5
    }
});

export default AlertModal;