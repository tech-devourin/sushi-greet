import CustomText from '@components/CustomText';
import AnimatedRefreshIcon from '@components/molecules/AnimatedRefreshIcon';
import Header from '@components/molecules/Header';
import { useAppDispatch, useAppSelector } from '@redux/Hooks';
import { selectBranchId, setIsLoading } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { isTablet, useEnvironment } from '@utils/Constants';
import { getTablesInfo } from '@utils/Helper';
import { ModalRefType } from '@utils/Types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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

    useEffect(() => {
        getTables();
    }, [branchId]);

    const gridData = useMemo(() => {
        const [cols, rows] = GRID_SIZE[branchId] || [4, 10];
        const totalCells = cols * rows;
        const tableMap = new Map();
        allTables.forEach(table => {
            if (table.layoutIndex) {
                tableMap.set(table.layoutIndex, table);
            }
        });

        const data = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const indexKey = `${r + 1},${c + 1}`;
                data.push({
                    id: indexKey,
                    table: tableMap.get(indexKey) || null,
                    row: r,
                    col: c
                });
            }
        }
        return { data, cols };
    }, [allTables, branchId]);

    const renderTable = ({ item }: any) => {
        if (!item.table) {
            return <View style={styles.emptyCell} />;
        }

        return (
            <View style={[styles.tableCell, { borderColor: item.table.s === 1 ? 'orange' : 'lightgray' }]}>
                <CustomText style={styles.tableName}>{item.table.n}</CustomText>
                <CustomText style={styles.tableStatus}>{item.table.s === 1 ? 'Occupied' : 'Free'}</CustomText>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Header
                rightComponent={
                    <View style={[GlobalStyles.justifiedRow]}>
                        <AnimatedRefreshIcon size={isTablet ? 30 : 25} color={'#fff'} getRefreshData={refreshHandler} />
                    </View>
                }
            />
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <CustomText style={styles.title}>All Tables</CustomText>
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
        paddingHorizontal: isTablet ? 20 : 10,
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
        margin: 5,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    emptyCell: {
        flex: 1,
        aspectRatio: 1,
        margin: 5,
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
    }
})