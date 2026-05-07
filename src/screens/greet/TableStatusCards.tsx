import CustomText from '@components/CustomText';
import AlertModal from '@components/modals/AlertModal';
import ModalAsBottomSheet from '@components/modals/BottomSheetModal';
import GreetTablesModal from '@components/modals/TablesModal';
import AnimatedRefreshIcon from '@components/molecules/AnimatedRefreshIcon';
import { Feather, Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '@redux/Hooks';
import { selectUserData, setIsLoading, setUserData } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, GREET_TABLE_STATUS_KEYS, isTablet, useEnvironment } from '@utils/Constants';
import { makeAPIRequest } from '@utils/Helper';
import { resetAndNavigate } from '@utils/NavigationUtil';
import { ModalRefType, TypeTableStatus } from '@utils/Types';
import * as Haptics from 'expo-haptics';
import { FC, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';

type Props = {
    refreshHandler: () => Promise<void>,
    tableStatus: TypeTableStatus,
    totalPax: number,
    totalReservations: number,
    modelRef: React.RefObject<ModalRefType | null>
}

const TableStatusCards: FC<Props> = ({ refreshHandler, tableStatus, totalPax, totalReservations, modelRef }) => {
    const dispatch = useAppDispatch();
    const { apiBaseUrl } = useEnvironment();
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const styles = createStyles(theme);
    const userData = useAppSelector(selectUserData);
    const totalTables = tableStatus.bp + tableStatus.f + tableStatus.ot;

    const [selectedItem, setSelectedItem] = useState<string>('');
    const [selectedTable, setSelectedTable] = useState<{ [key: string]: any } | null>(null);

    const StatusItem = (item: string, index: number) => {
        const percentage = totalTables > 0 ? (tableStatus[item as keyof TypeTableStatus] / totalTables) * 100 : 0;
        return (
            <TouchableOpacity
                key={index}
                style={[
                    styles.statusCard,
                    {
                        backgroundColor: GREET_TABLE_STATUS_COLOR[item as keyof TypeTableStatus],
                        borderColor: GREET_TABLE_BORDER_COLOR[item as keyof TypeTableStatus]
                    }
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                    setSelectedItem(item);
                    modelRef.current?.open('tables', theme.device.height * 0.75);
                }}>
                <View>
                    <CustomText style={styles.statusValueText}>{tableStatus[item as keyof TypeTableStatus]}</CustomText>
                    <CustomText style={styles.statusLabel}>{GREET_TABLE_STATUS_KEYS[item]}</CustomText>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: theme.colors.theme }]} />
                </View>
                <View style={styles.arrowIcon}>
                    <Feather name='arrow-up-right' size={isTablet ? 22 : 18} color={theme.colors.grayDark} />
                </View>
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

    const logoutStaff = async (ipPage?: boolean) => {
        await resetAndNavigate(ipPage ? 'IPconfig' : 'EnterPin', userData?.userId);
        dispatch(setUserData({ userData: {} }));
        await AsyncStorage.multiRemove(["loggedIn", "selectedModule", ...(ipPage ? ['initialSetup'] : [])]);
    };

    const renderContent = (key: string | null) => {
        console.log('uhej')
        switch (key) {
            case 'tables':
                return <GreetTablesModal closeModal={() => { modelRef.current?.close() }} type={selectedItem as keyof TypeTableStatus} submitHandler={async (item, tableId) => { modelRef.current?.replace('free'); setSelectedTable(item); }} />
            case 'free':
                return <AlertModal closeModal={() => { modelRef.current?.close() }} description={`Are you sure, you want to free table ${selectedTable?.n}?`} heading={`Free Table - ${selectedTable?.n}`} onConfirm={freeTableHandler} />
            case 'logout':
                return <AlertModal closeModal={() => { modelRef.current?.close() }} description={"Are you sure, you want to logout ?"} heading={"Logout"} onConfirm={logoutStaff} />
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <ModalAsBottomSheet ref={modelRef} renderContent={renderContent} showCloseBtn />
            
            <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText style={styles.statusText}>Table Status</CustomText>
                    <AnimatedRefreshIcon getRefreshData={refreshHandler} />
                </View>
                
                <View style={styles.statsContainer}>
                    <View style={styles.statsBadge}>
                        <Octicons name='checklist' size={isTablet ? 22 : 18} color={theme.colors.text} />
                        <CustomText style={styles.statsValue}>{totalReservations}</CustomText>
                    </View>
                    
                    <View style={[styles.statsBadge, { marginLeft: isTablet ? 15 : 10 }]}>
                        <Octicons name='people' size={isTablet ? 22 : 18} color={theme.colors.text} />
                        <CustomText style={styles.statsValue}>{totalPax}</CustomText>
                    </View>
                </View>
            </View>

            <View style={styles.cardsRow}>
                {Object.keys(GREET_TABLE_STATUS_KEYS).map((item: string, index: number) => StatusItem(item, index))}
            </View>
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        marginTop: 15,
        paddingHorizontal: isTablet ? 10 : 0
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    statusText: {
        fontSize: isTablet ? theme.fontSize.headingX : theme.fontSize.heading,
        fontFamily: theme.fonts.SemiBold,
        marginRight: 10,
        color: theme.colors.text
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.lightGray2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    statsValue: {
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
        fontFamily: theme.fonts.Bold,
        marginLeft: 8,
        color: theme.colors.text
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    statusCard: {
        width: '31.5%',
        justifyContent: 'space-between',
        padding: isTablet ? 20 : 15,
        height: isTablet ? 160 : 130,
        borderRadius: 20,
        borderWidth: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    statusValueText: { // Renamed from statusValue to avoid conflict
        fontSize: isTablet ? theme.fontSize.headingX * 1.3 : theme.fontSize.headingX,
        fontFamily: theme.fonts.Bold,
        includeFontPadding: false,
        color: theme.colors.text
    },
    statusLabel: {
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.small,
        fontFamily: theme.fonts.Medium,
        opacity: 0.8,
        marginTop: 2,
        color: theme.colors.text
    },
    progressBar: {
        height: isTablet ? 8 : 6,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
    },
    arrowIcon: {
        position: 'absolute',
        top: isTablet ? 18 : 12,
        right: isTablet ? 18 : 12,
        opacity: 0.5
    }
});

export default TableStatusCards;

