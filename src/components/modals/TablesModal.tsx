import CustomText from '@components/CustomText';
import ModalHeader from '@components/molecules/ModalHeader';
import SubmitCancelButtons from '@components/molecules/SubmitCancelButtons';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useAppSelector } from '@redux/Hooks';
import { selectBranchId } from '@redux/States';
import { GREET_KEY_TO_STATE, GREET_TABLE_STATUS_COLOR, GREET_TABLE_STATUS_KEYS, isTablet, useEnvironment } from '@utils/Constants';
import { makeAPIRequest } from '@utils/Helper';
import { TypeTableStatus } from '@utils/Types';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';

type TypeGreetTablesModal = {
    closeModal: () => void,
    type: keyof TypeTableStatus;
    reservation?: any,
    submitHandler: (item: any, tableId?: number) => Promise<void>,
}

const GreetTablesModal: FC<TypeGreetTablesModal> = ({ closeModal, type, reservation, submitHandler }) => {
    const { apiBaseUrl } = useEnvironment();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const branchId = useAppSelector(selectBranchId) || 0;
    // const dineInArea = useAppSelector(selectDineInAreas) || [];
    // const dineInAreaIds = dineInArea?.map((item: any) => item.id);
    const [tables, setTables] = useState<{ [key: string]: any }[]>([]);
    const [loader, setLoader] = useState<boolean>(false);
    const [selected, setSelected] = useState<{ [key: string]: any } | null>(null);

    const getTablesInfo = async () => {
        setLoader(true);
        const url = `${apiBaseUrl}tablestatebybranch?br_id=${branchId}&state=${GREET_KEY_TO_STATE[type]}`;
        const response = await makeAPIRequest(url, null, "GET");
        // if (response) {
        //     const filteredTables = response.filter((item: any) => item.hasOwnProperty('dineInAreaId') ? dineInAreaIds.includes(item.dineInAreaId) : true);
        //     setTables(reservation ? filteredTables.filter((item: any) => reservation.tn !== item.n) : filteredTables);
        // }
        setLoader(false);
    };

    const handleTablePress = (item: any) => {
        if (reservation) {
            setSelected(item);
        } else if (type === 'ot') {
            item.runningOrder ? Toast.show({ type: 'error', text1: 'Order is running on this table', text2: `Can't free table if order is running` }) : submitHandler(item);
        }
    };

    const renderBox = ({ item }: { item: any }) => (
        <TouchableOpacity activeOpacity={reservation || type === 'ot' ? 0.2 : 1} style={[styles.box, { backgroundColor: selected?.n === item.n ? theme.colors.successLight : item.t && reservation ? theme.colors.errorLight : GREET_TABLE_STATUS_COLOR[type], borderColor: selected?.n === item.n ? theme.colors.success : item.t && reservation ? theme.colors.error : 'lightgray', }]} onPress={() => { handleTablePress(item) }}>
            {item.t && reservation && <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 5, left: 5 }}>
                <Octicons name="clock" size={isTablet ? 15 : 12} color="black" style={{ marginRight: 2 }} />
                <CustomText fontSize={isTablet ? theme.fontSize.regular : theme.fontSize.small}>{moment(item.t).format('hh:mm A')}</CustomText>
                <CustomText style={{ fontSize: theme.fontSize.small, color: '#c92824' }}> ({item?.isWalk ? 'W' : 'R'})</CustomText>
            </View>}
            {type === 'ot' && item.runningOrder && <CustomText style={styles.orderRunning}>Order Running</CustomText>}
            <CustomText style={[styles.boxText]} numberOfLines={3}>{item.n}</CustomText>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 5, right: 5 }}>
                <Octicons name="people" size={isTablet ? 20 : 15} color="black" style={{ marginRight: 2 }} />
                <CustomText fontSize={isTablet ? theme.fontSize.medium : theme.fontSize.regular}>{item.c}</CustomText>
            </View>
        </TouchableOpacity>
    );

    useEffect(() => {
        getTablesInfo();
    }, []);

    return (
        <>
            <ModalHeader heading={reservation ? 'Shift Table' : GREET_TABLE_STATUS_KEYS[type]} />
            {tables.length > 0 ?
                <View style={{ flex: 1 }}>
                    <View style={[styles.tableView, { paddingHorizontal: 10, flex: 1 }]}>
                        <FlatList
                            data={tables}
                            renderItem={renderBox}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5} />
                    </View>
                    {reservation &&
                        <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
                            <SubmitCancelButtons cancelHandler={closeModal} cancelText="Cancel" submitHandler={async () => { await submitHandler(reservation, selected?.id) }} submitText={"Shift"} disabledSubmit={!selected} />
                        </View>
                    }
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
        height: 100,
        maxWidth: "30%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0.5,
        borderRadius: 10,
    },
    boxText: {
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.Medium,
        width: '90%',
        textAlign: 'center'
    },
    orderRunning: { fontSize: theme.fontSize.xsmall, position: 'absolute', top: 5, left: 5, paddingHorizontal: 5, paddingVertical: 3, backgroundColor: theme.colors.default, borderRadius: 5, color: '#fff' }
});

export default GreetTablesModal;