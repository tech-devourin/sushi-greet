import CustomText from '@components/CustomText';
import { Octicons } from '@expo/vector-icons';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, isTablet } from '@utils/Constants';
import moment from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'src/context/ThemeContext';

import { useOrientation } from '@hooks/useOrientation';
import Toast from 'react-native-toast-message';

interface TableBoxProps {
    table: any;
    onPress?: (table: any) => void;
    style?: ViewStyle;
    screenType: 'reservation' | 'status';
    refreshTime?: number;
}

const TableBox: React.FC<TableBoxProps> = ({ table, onPress, style, screenType, refreshTime }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const isLandscape = useOrientation();
    const type = table.st === 'PRINT_BILL' ? 'bp' : !!table.ro ? 'ot' : 'f';

    const getTimeSpent = (startTime: string) => {
        if (!startTime) return "";
        const now = moment();
        const start = moment(startTime);
        const duration = moment.duration(now.diff(start));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        return hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`;
    };

    const timeSpent = (type === 'bp' || type === 'ot') ? getTimeSpent(table.ro) : "";

    const handlePress = () => {
        if (screenType === 'reservation' && type !== 'f') {
            Toast.show({
                type: 'error',
                text1: 'Sorry, table is already occupied'
            });
            return;
        }
        onPress && onPress(table);
    };

    return (
        <TouchableOpacity
            style={[
                styles.tableCell,
                {
                    backgroundColor: GREET_TABLE_STATUS_COLOR[type],
                    borderColor: GREET_TABLE_BORDER_COLOR[type],
                    height: 120
                },
                style
            ]}
            onPress={handlePress}
            disabled={screenType === 'status' ? (type === 'f') : false}
        >
            {(type === 'bp' || type === 'ot') && (
                <View style={styles.timeContainer}>
                    <Octicons name="clock" size={isTablet ? 15 : 12} color="black" style={{ marginRight: 2 }} />
                    <CustomText fontSize={isTablet ? theme.fontSize.regular : theme.fontSize.small} fontFamily={theme.fonts.Medium}>
                        {timeSpent}
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.boxText} numberOfLines={3}>
                {table.name || table.n}
            </CustomText>
            <View style={[styles.paxShape, { width: isLandscape ? '50%' : '60%' }, !isLandscape ? { aspectRatio: 1 } : { height: '90%' }]}>
                <Svg height="100%" width="100%" viewBox="0 0 600 600" preserveAspectRatio="none">
                    <Path d="M 0 600 C 200 550 550 300 600 -2 L 600 600 L 0 600 Z" fill={theme.colors.theme} />
                </Svg>
                <View style={styles.paxTextContainer}>
                    <CustomText
                        fontSize={isTablet ? theme.fontSize.large : theme.fontSize.medium}
                        fontFamily={theme.fonts.SemiBold}
                        color="white"
                    >
                        {table.capacity ?? table.c ?? 0}
                    </CustomText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    tableCell: {
        flex: 1,
        margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 5,
        left: 5
    },
    paxShape: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    paxTextContainer: {
        position: 'absolute',
        bottom: 8,
        right: 10,
    },
    boxText: {
        fontSize: theme.fontSize.heading,
        fontFamily: theme.fonts.SemiBold,
        width: '90%',
        textAlign: 'center'
    },
});

export default TableBox;
