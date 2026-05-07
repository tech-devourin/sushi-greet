import CustomText from '@components/CustomText';
import ModalHeader from '@components/molecules/ModalHeader';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useAppSelector } from '@redux/Hooks';
import { selectBranchId } from '@redux/States';
import { GREET_TABLE_BORDER_COLOR, GREET_TABLE_STATUS_COLOR, GREET_TABLE_STATUS_KEYS, isTablet, useEnvironment } from '@utils/Constants';
import { getTablesInfo } from '@utils/Helper';
import { TypeTableStatus } from '@utils/Types';
import moment from "moment";
import { FC, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
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
        const filteredTables = tables.filter((item: any) => type === "bp" ? item.st === 'PRINT_BILL' : type === "ot" ? !!item.ro : !item.ro);
        setTables(filteredTables);
        setLoader(false);
    };

    const renderBox = ({ item }: { item: any }) => (
        <TouchableOpacity activeOpacity={type === 'ot' ? 0.2 : 1} style={[styles.box, { backgroundColor: GREET_TABLE_STATUS_COLOR[type], borderColor: GREET_TABLE_BORDER_COLOR[type], }]} onPress={() => { submitHandler(item) }} disabled={type === 'f'}>
            {(type === 'bp' || type === 'ot') && <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 5, left: 5 }}>
                <Octicons name="clock" size={isTablet ? 15 : 12} color="black" style={{ marginRight: 2 }} />
                {/* //here instead show time spend */}
                <CustomText fontSize={isTablet ? theme.fontSize.regular : theme.fontSize.small} fontFamily={theme.fonts.Medium}>{moment(item.ro).format('hh:mm A')}</CustomText>
            </View>}
            <CustomText style={[styles.boxText]} numberOfLines={3}>{item.name}</CustomText>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 5, right: 5 }}>
                <Octicons name="people" size={isTablet ? 20 : 15} color="black" style={{ marginRight: 3 }} />
                <CustomText fontSize={isTablet ? theme.fontSize.medium : theme.fontSize.regular} fontFamily={theme.fonts.Medium}>{item.capacity ?? 0}</CustomText>
            </View>
        </TouchableOpacity>
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
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0.5,
        borderRadius: 10,
        maxWidth: isTablet ? '24%' : '30%'
    },
    boxText: {
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.SemiBold,
        width: '90%',
        textAlign: 'center'
    },
    orderRunning: { fontSize: theme.fontSize.xsmall, position: 'absolute', top: 5, left: 5, paddingHorizontal: 5, paddingVertical: 3, backgroundColor: theme.colors.default, borderRadius: 5, color: '#fff' }
});

export default GreetTablesModal;