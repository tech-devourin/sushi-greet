import CustomText from '@components/CustomText';
import AlertModal from '@components/modals/AlertModal';
import ModalAsBottomSheet from '@components/modals/BottomSheetModal';
import PaxSetModal from '@components/modals/PaxSetModal';
import AnimatedRefreshIcon from '@components/molecules/AnimatedRefreshIcon';
import Header from '@components/molecules/Header';
import TableBox from '@components/molecules/TableBox';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@redux/Hooks';
import { selectBranchId, selectUserData, setIsLoading } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { isTablet, TABLE_REFRESH_INTERVAL, useEnvironment } from '@utils/Constants';
import { callQRApi, getTablesInfo, logoutStaff, makeAPIRequest } from '@utils/Helper';
import { replace } from '@utils/NavigationUtil';
import { ModalRefType } from '@utils/Types';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';

const GRID_SIZE: any = {
    1: [4, 27],
    2: [6, 13]
}

const TableLayout = ({ navigation }: any) => {
    const { theme } = useTheme();
    const dispatch = useAppDispatch();
    const { apiBaseUrl } = useEnvironment();
    const branchId = useAppSelector(selectBranchId) || 0;
    const styles = createStyles(theme);
    const userData = useAppSelector(selectUserData);

    const GlobalStyles = useGlobalStyles();
    const modelRef = useRef<ModalRefType | null>(null);
    const [allTables, setAllTables] = useState<{ [key: string]: any }[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ [key: string]: any } | null>(null);
    const [refreshTime, setRefreshTime] = useState(Date.now());

    const getTables = async () => {
        dispatch(setIsLoading({ isLoading: true }));
        const tables = await getTablesInfo(apiBaseUrl, branchId);
        if (tables) {
            setAllTables(tables);
            setRefreshTime(Date.now());
        }
        dispatch(setIsLoading({ isLoading: false }));
    };

    const refreshHandler = async () => {
        const tables = await getTablesInfo(apiBaseUrl, branchId);
        if (tables) {
            setAllTables(tables);
            setRefreshTime(Date.now());
        }
    };

    const gridData = useMemo(() => {
        const [cols, rows] = GRID_SIZE[branchId];
        const tableMap = new Map();
        allTables.forEach(table => {
            if (table.layoutIndex) {
                tableMap.set(table.layoutIndex, table);
            }
        });

        const data = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const indexKey = `${c + 1},${r + 1}`;
                data.push({
                    id: indexKey,
                    table: tableMap.get(indexKey) || null,
                    row: c,
                    col: r
                });
            }
        }
        return { data, cols };
    }, [allTables, branchId]);

    const renderTable = ({ item }: any) => {
        if (!item.table) {
            return <View style={styles.emptyCell} />;
        }
        return <TableBox
            table={item.table}
            onPress={() => { modelRef.current?.open('paxSet'); setSelectedItem(item.table) }}
            screenType='reservation'
            refreshTime={refreshTime}
        />;
    };

    const createReservation = async (pax: number) => {
        dispatch(setIsLoading({ isLoading: true }));
        const url = `${apiBaseUrl}hostessreservetable`;
        const body = {
            accepted: 1,
            checkedIn: 1,
            customerid: 1,
            duration: 2,
            partySize: pax,
            queued: false,
            reservationDate: moment().format('YYYY-MM-DD'),
            reservationTime: moment().format('HH:mm'),
            source: "CaptainPad",
            staffId: userData?.userId,
            tableId: selectedItem?.tid
        }
        const res = await makeAPIRequest(url, body, 'POST');
        dispatch(setIsLoading({ isLoading: false }));
        if (res) {
            await callQRApi(apiBaseUrl, selectedItem?.tid);
            await refreshHandler();
            setTimeout(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Reservation created successfully'
                });
            }, 250);
        }
    }

    const renderContent = (key: string | null) => {
        switch (key) {
            case 'paxSet':
                return <PaxSetModal
                    table={selectedItem}
                    closeModal={() => modelRef.current?.close()}
                    onSubmit={(pax) => {
                        modelRef.current?.close();
                        createReservation(pax);
                    }}
                />;
            case 'logout':
                return <AlertModal closeModal={() => { modelRef.current?.close() }} description={"Are you sure, you want to logout ?"} heading={"Logout"} onConfirm={logoutStaff} />
            default:
                return null;
        }
    };

    useFocusEffect(
        useCallback(() => {
            getTables();
            const intervalId = setInterval(async () => {
                refreshHandler();
            }, TABLE_REFRESH_INTERVAL);
            return () => clearInterval(intervalId);
        }, [branchId]));

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ModalAsBottomSheet ref={modelRef} renderContent={renderContent} showCloseBtn />
            <Header
                rightComponent={
                    <View style={[GlobalStyles.justifiedRow]}>
                        <TouchableOpacity onPress={() => { replace('Dashboard') }} style={{ marginRight: 20, padding: 5 }}>
                            <Feather name="home" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { modelRef.current?.open('logout') }} style={{ padding: 5 }}>
                            <Feather name="log-out" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                }
            />
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 }}>
                    <CustomText style={styles.title}>All Tables</CustomText>
                    <AnimatedRefreshIcon getRefreshData={refreshHandler} />
                </View>

                <FlatList
                    data={gridData.data}
                    extraData={refreshTime}
                    keyExtractor={(item) => item.id}
                    numColumns={gridData.cols}
                    renderItem={renderTable}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    )
}

export default TableLayout

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 30,
    },
    title: {
        fontSize: isTablet ? theme.fontSize.headingX : theme.fontSize.heading,
        fontFamily: theme.fonts.SemiBold,
        marginRight: 10,
        color: theme.colors.text
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyCell: {
        flex: 1,
        aspectRatio: 1.5,
        margin: 3,
    },
})