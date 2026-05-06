import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

const SuccessToast = (props: any) => {
    const { theme } = useTheme();
    return (
        <BaseToast
            {...props}
            style={{ backgroundColor: theme.colors.success, borderLeftColor: theme.colors.success, height: 50 }}
            text1Style={{ color: "#fff", marginLeft: -10 }}
            text1NumberOfLines={2}
            text2NumberOfLines={2}
            text2Style={{ fontSize: theme.fontSize.extraSmall, color: "#fff", marginLeft: -10 }}
            renderTrailingIcon={() => (
                <TouchableOpacity style={{ marginRight: 10, justifyContent: 'center' }} onPress={() => { Toast.hide() }}>
                    <Ionicons name="close" size={20} color={"#fff"} />
                </TouchableOpacity>
            )}
        />
    );
};

const ErrorToast = (props: any) => {
    const { theme } = useTheme();
    return (
        <BaseToast
            {...props}
            style={[{ borderLeftColor: theme.colors.error, backgroundColor: theme.colors.error }, !props.text2 && { height: 50 }]}
            text1Style={{ color: "#fff", marginLeft: -10 }}
            text1NumberOfLines={2}
            text2NumberOfLines={2}
            text2Style={{ fontSize: theme.fontSize.extraSmall, color: "#fff", marginLeft: -10 }}
            renderTrailingIcon={() => (
                <TouchableOpacity style={{ marginRight: 10, justifyContent: 'center' }} onPress={() => { Toast.hide() }}>
                    <Ionicons name="close" size={20} color={"#fff"} />
                </TouchableOpacity>
            )}
        />
    );
};

const InfoToast = (props: any) => {
    const { theme } = useTheme();
    return (
        <BaseToast
            {...props}
            style={[{ borderLeftColor: theme.colors.default, backgroundColor: theme.colors.default }, !props.text2 && { height: 50 }]}
            text1Style={{ color: "#fff", marginLeft: -10 }}
            text2Style={{ color: "#fff", marginLeft: -10, fontSize: theme.fontSize.extraSmall }}
            text1NumberOfLines={1}
            text2NumberOfLines={2}
            renderTrailingIcon={() => (
                <TouchableOpacity style={{ marginRight: 10, justifyContent: 'center' }} onPress={() => { Toast.hide() }}>
                    <Ionicons name="close" size={20} color={"#fff"} />
                </TouchableOpacity>
            )}
        />
    );
};

const WarningToast = (props: any) => {
    const { theme } = useTheme();
    return (
        <BaseToast
            {...props}
            style={[{ borderLeftColor: theme.colors.default, backgroundColor: theme.colors.default }, !props.text2 && { height: 50 }]}
            text1Style={{ color: "#fff", marginLeft: -10 }}
            text2Style={{ color: "#fff", marginLeft: -10, fontSize: theme.fontSize.extraSmall }}
            text1NumberOfLines={1}
            text2NumberOfLines={2}
            renderTrailingIcon={() => (
                <TouchableOpacity style={{ marginRight: 10, justifyContent: 'center' }} onPress={() => { Toast.hide() }}>
                    <Ionicons name="close" size={20} color={"#fff"} />
                </TouchableOpacity>
            )}
        />
    );
};

const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,
    error: (props: any) => <ErrorToast {...props} />,
    info: (props: any) => <InfoToast {...props} />,
    warning: (props: any) => <WarningToast {...props} />,
};

export default toastConfig;