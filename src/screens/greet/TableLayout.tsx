import CustomText from '@components/CustomText';
import AlertModal from '@components/modals/AlertModal';
import ModalAsBottomSheet from '@components/modals/BottomSheetModal';
import AnimatedRefreshIcon from '@components/molecules/AnimatedRefreshIcon';
import Header from '@components/molecules/Header';
import { Feather, Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@redux/Hooks';
import { selectBranchId, setIsLoading } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, isTablet, TABLE_REFRESH_INTERVAL, useEnvironment } from '@utils/Constants';
import { getTablesInfo, logoutStaff } from '@utils/Helper';
import { replace } from '@utils/NavigationUtil';
import { ModalRefType } from '@utils/Types';
import moment from 'moment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

const GRID_SIZE: any = {
    1: [4, 27],
    2: [6, 13]
}
//here 1 is branchId and 4 is col, 20 is rows

const TableLayout = ({ navigation }: any) => {
    const { theme } = useTheme();
    const dispatch = useAppDispatch();
    const { apiBaseUrl } = useEnvironment();
    const branchId = useAppSelector(selectBranchId) || 0;
    const styles = createStyles(theme);

    const GlobalStyles = useGlobalStyles();
    const modelRef = useRef<ModalRefType | null>(null);
    const [allTables, setAllTables] = useState<{ [key: string]: any }[]>([]);

    const getTables = async () => {
        dispatch(setIsLoading({ isLoading: true }));
        const tables = await getTablesInfo(apiBaseUrl, branchId);
        if (tables) {
            setAllTables(tables);
        }
        dispatch(setIsLoading({ isLoading: false }));
    };

    const refreshHandler = async () => {
        const tables = await getTablesInfo(apiBaseUrl, branchId);
        if (tables) {
            setAllTables(tables);
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
        const type = item.table.st === 'PRINT_BILL' ? 'bp' : !!item.table.ro ? 'ot' : 'f';
        return (
            <TouchableOpacity activeOpacity={type === 'ot' ? 0.2 : 1} style={[styles.tableCell, { backgroundColor: GREET_TABLE_STATUS_COLOR[type], borderColor: GREET_TABLE_BORDER_COLOR[type], }]} onPress={() => { }} disabled={type === 'f'}>
                {(type === 'bp' || type === 'ot') && <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 5, left: 5 }}>
                    <Octicons name="clock" size={isTablet ? 15 : 12} color="black" style={{ marginRight: 2 }} />
                    {/* //here instead show time spend */}
                    <CustomText fontSize={isTablet ? theme.fontSize.regular : theme.fontSize.small} fontFamily={theme.fonts.Medium}>{moment(item.table.ro).format('hh:mm A')}</CustomText>
                </View>}
                <CustomText style={[styles.boxText]} numberOfLines={3}>{item.table.name}</CustomText>
                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 5, right: 5 }}>
                    <Octicons name="people" size={isTablet ? 20 : 15} color="black" style={{ marginRight: 3 }} />
                    <CustomText fontSize={isTablet ? theme.fontSize.medium : theme.fontSize.regular} fontFamily={theme.fonts.Medium}>{item.table.capacity ?? 0}</CustomText>
                </View>
            </TouchableOpacity>
        );
    };

    const renderContent = (key: string | null) => {
        switch (key) {
            case 'paxSet':
            // return <GreetTablesModal closeModal={() => { modelRef.current?.close() }} type={selectedItem as keyof TypeTableStatus} submitHandler={(item) => { modelRef.current?.replace('qrPrint'); setSelectedTable(item); }} />
            case 'logout':
                return <AlertModal closeModal={() => { modelRef.current?.close() }} description={"Are you sure, you want to logout ?"} heading={"Logout"} onConfirm={logoutStaff} />
            default:
                return null;
        }
    };

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
        marginTop: 20,
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
    tableCell: {
        flex: 1,
        aspectRatio: 1,
        margin: 3,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCell: {
        flex: 1,
        aspectRatio: 1,
        margin: 3,
    },
    tableName: {
        fontFamily: theme.fonts.Bold,
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
        color: '#333',
    },
    tableStatus: {
        fontFamily: theme.fonts.Regular,
        fontSize: isTablet ? theme.fontSize.medium : theme.fontSize.small,
        color: '#666',
        marginTop: 4,
    },
    boxText: {
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.SemiBold,
        width: '90%',
        textAlign: 'center'
    },
})