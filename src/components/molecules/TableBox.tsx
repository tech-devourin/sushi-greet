import CustomText from '@components/CustomText';
import { Octicons } from '@expo/vector-icons';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, isTablet } from '@utils/Constants';
import moment from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

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
            <View style={styles.paxContainer}>
                <Octicons name="people" size={isTablet ? 20 : 15} color="black" style={{ marginRight: 3 }} />
                <CustomText fontSize={isTablet ? theme.fontSize.medium : theme.fontSize.regular} fontFamily={theme.fonts.Medium}>
                    {table.capacity ?? table.c ?? 0}
                </CustomText>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    tableCell: {
        flex: 1,
        aspectRatio: 1,
        margin: 3,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 5,
        left: 5
    },
    paxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5,
        right: 5
    },
    boxText: {
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.SemiBold,
        width: '90%',
        textAlign: 'center'
    },
});

export default TableBox;
