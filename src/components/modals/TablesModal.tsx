import CustomText from '@components/CustomText';
import ModalHeader from '@components/molecules/ModalHeader';
import TableBox from '@components/molecules/TableBox';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@redux/Hooks';
import { selectBranchId } from '@redux/States';
import { GREET_TABLE_STATUS_KEYS, isTablet, useEnvironment } from '@utils/Constants';
import { getTablesInfo } from '@utils/Helper';
import { TypeTableStatus } from '@utils/Types';
import { FC, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

type TypeGreetTablesModal = {
    closeModal: () => void,
    type: keyof TypeTableStatus;
    submitHandler: (item: any) => void,
}

const GreetTablesModal: FC<TypeGreetTablesModal> = ({ closeModal, type, submitHandler }) => {
    const { apiBaseUrl } = useEnvironment();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const branchId = useAppSelector(selectBranchId) || 0;
    const [tables, setTables] = useState<{ [key: string]: any }[]>([]);
    const [loader, setLoader] = useState<boolean>(false);

    const getTables = async () => {
        setLoader(true);
        const tables = await getTablesInfo(apiBaseUrl, branchId);
        const filteredTables = tables.filter((item: any) => type === "bp" ? item.st === 'PRINT_BILL' : type === "ot" ? (!!item.ro && item.st !== 'PRINT_BILL') : !item.ro);
        setTables(filteredTables);
        setLoader(false);
    };

    const renderBox = ({ item }: { item: any }) => (
        <TableBox
            table={item}
            onPress={submitHandler}
            style={styles.box}
            screenType='status'
        />
    );

    useEffect(() => {
        getTables();
    }, []);

    return (
        <>
            <ModalHeader heading={GREET_TABLE_STATUS_KEYS[type]} />
            {tables.length > 0 ?
                <View style={{ flex: 1 }}>
                    <View style={[styles.tableView, { paddingHorizontal: 10, flex: 1 }]}>
                        <FlatList
                            data={tables}
                            renderItem={renderBox}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={isTablet ? 4 : 3}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5} />
                    </View>
                </View> :
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {loader ? <ActivityIndicator color={theme.colors.theme} /> : <Ionicons name="alert-circle-outline" size={40} color={theme.colors.default} />}
                    <CustomText style={{ marginTop: 10, color: theme.colors.grayDark }}>{loader ? "Loading" : `No ${GREET_TABLE_STATUS_KEYS[type]}`}</CustomText>
                </View>
            }
        </>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    tableView: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 10,
        borderTopColor: 'lightgray',
        borderBottomColor: 'lightgray',
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.lightGray2
    },
    flatListContent: {
        paddingVertical: 10,
    },
    box: {
        flex: 1,
        margin: 10,
        maxWidth: isTablet ? '24%' : '30%'
    },
});

export default GreetTablesModal;