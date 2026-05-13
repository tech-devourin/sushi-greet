import CustomText from '@components/CustomText';
import { OTA_VERSION } from '@utils/Constants';
import Constants from 'expo-constants';
import { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

type TypeModalHeader = {
    prefixIcon?: any,
    heading: string,
    children?: React.ReactNode
}

const ModalHeader: FC<TypeModalHeader> = ({ heading, prefixIcon, children }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.header}>
            <View style={styles.container}>
                {prefixIcon && prefixIcon}
                <CustomText style={styles.headerText} numberOfLines={1}>{heading}</CustomText>
                <View style={{ flex: 1 }} />
                {heading === 'Logout' && <CustomText style={styles.versionText}>v{Constants.expoConfig?.version}_{OTA_VERSION}</CustomText>}
            </View>
            {children}
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'lightgray'
    },
    headerText: {
        fontFamily: theme.fonts.Medium,
        fontSize: theme.fontSize.headingX,
    },
    versionText: {
        color: theme.colors.grayDark,
        fontSize: theme.fontSize.small
    }
});

export default ModalHeader;