import CustomText from '@components/CustomText';
import AlertModal from '@components/modals/AlertModal';
import ModalAsBottomSheet from '@components/modals/BottomSheetModal';
import GreetTablesModal from '@components/modals/TablesModal';
import AnimatedRefreshIcon from '@components/molecules/AnimatedRefreshIcon';
import { Feather, Octicons } from '@expo/vector-icons';
import { useAppDispatch } from '@redux/Hooks';
import { setIsLoading } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, GREET_TABLE_STATUS_KEYS, isTablet, useEnvironment } from '@utils/Constants';
import { makeAPIRequest } from '@utils/Helper';
import { ModalRefType, TypeTableStatus } from '@utils/Types';
import * as Haptics from 'expo-haptics';
import { FC, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';

type Props = {
    refreshHandler: () => Promise<void>,
    tableStatus: TypeTableStatus,
    totalPax: number,
    totalReservations: number
}

const TableStatusCards: FC<Props> = ({ refreshHandler, tableStatus, totalPax, totalReservations }) => {
    const dispatch = useAppDispatch();
    const { apiBaseUrl } = useEnvironment();
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const styles = createStyles(theme);
    const modelRef = useRef<ModalRefType | null>(null);
    const totalTables = tableStatus.bp + tableStatus.f + tableStatus.ot;

    const [selectedItem, setSelectedItem] = useState<string>('');
    const [selectedTable, setSelectedTable] = useState<{ [key: string]: any } | null>(null);

    const StatusItem = (item: string, index: number) => {
        const percentage = totalTables > 0 ? (tableStatus[item as keyof TypeTableStatus] / totalTables) * 100 : 0;
        return (
            <TouchableOpacity key={index} style={[{ width: '30%', justifyContent: 'space-between', backgroundColor: GREET_TABLE_STATUS_COLOR[item as keyof TypeTableStatus], padding: 15, height: isTablet ? 150 : 120, borderRadius: 10, borderWidth: 0.5, borderColor: GREET_TABLE_BORDER_COLOR[item as keyof TypeTableStatus] }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                    setSelectedItem(item);
                    modelRef.current?.open('tables', theme.device.height * 0.75);
                }}>
                <View>
                    <CustomText style={{ fontSize: theme.fontSize.heading, fontFamily: theme.fonts.SemiBold }}>{tableStatus[item as keyof TypeTableStatus]}</CustomText>
                    <CustomText>{GREET_TABLE_STATUS_KEYS[item]}</CustomText>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: theme.colors.theme }]} />
                </View>
                <Feather name='arrow-up-right' style={{ position: 'absolute', top: 10, right: 10 }} size={isTablet ? 20 : 15} color={theme.colors.grayDark} />
            </TouchableOpacity>
        )
    };

    const freeTableHandler = async () => {
        modelRef.current?.close();
        dispatch(setIsLoading({ isLoading: true }));
        const url = apiBaseUrl + `checkedOutTableReservation?table_id=${selectedTable?.id}`;
        const response = await makeAPIRequest(url, null, 'PUT');
        if (response) {
            Toast.show({ type: 'success', text1: 'Table freed successfully' });
            await refreshHandler?.();
        }
        dispatch(setIsLoading({ isLoading: false }));
    };

    const renderContent = (key: string | null) => {
        switch (key) {
            case 'tables':
                return <GreetTablesModal closeModal={() => { modelRef.current?.close() }} type={selectedItem as keyof TypeTableStatus} submitHandler={async (item, tableId) => { modelRef.current?.replace('free'); setSelectedTable(item); }} />
            case 'free':
                return <AlertModal closeModal={() => { modelRef.current?.close() }} description={`Are you sure, you want to free table ${selectedTable?.n}?`} heading={`Free Table - ${selectedTable?.n}`} onConfirm={freeTableHandler} />
            default:
                return null;
        }
    };

    return (
        <View>
            <ModalAsBottomSheet ref={modelRef} renderContent={renderContent} showCloseBtn />
            <View style={[GlobalStyles.justifiedRow]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText style={styles.statusText}>Table Status</CustomText>
                    <AnimatedRefreshIcon getRefreshData={refreshHandler} />
                </View>
                <View style={[GlobalStyles.justifiedRow]}>
                    <View style={GlobalStyles.justifiedRow}>
                        <Octicons name='checklist' size={isTablet ? 25 : 20} style={{ marginRight: 5 }} />
                        <CustomText style={styles.text2}>{totalReservations}</CustomText>
                    </View>
                    <View style={[GlobalStyles.justifiedRow, { marginLeft: isTablet ? 30 : 15 }]}>
                        <Octicons name='people' size={isTablet ? 25 : 20} style={{ marginRight: 5 }} />
                        <CustomText style={styles.text2}>{totalPax}</CustomText>
                    </View>
                </View>
            </View>
            <View style={[GlobalStyles.justifiedRow, { marginVertical: 10 }]}>
                {Object.keys(GREET_TABLE_STATUS_KEYS).map((item: string, index: number) => StatusItem(item, index))}
            </View>
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    statusText: {
        fontSize: theme.fontSize.headingX,
        fontFamily: theme.fonts.Medium,
        marginRight: 10
    },
    progressBar: {
        height: 5,
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 5,
        marginVertical: 5
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    text2: {
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
        fontFamily: theme.fonts.Medium
    }
});

export default TableStatusCards;

