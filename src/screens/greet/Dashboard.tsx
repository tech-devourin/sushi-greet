import CustomText from '@components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@redux/Hooks';
import { selectBranchId } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { isTablet, TABLE_REFRESH_INTERVAL, useEnvironment } from '@utils/Constants';
import { makeAPIRequest } from '@utils/Helper';
import { navigate } from '@utils/NavigationUtil';
import { ModalRefType, TypeTableStatus } from '@utils/Types';
import moment from 'moment';
import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from "src/context/ThemeContext";
import TableStatusCards from './TableStatusCards';

const GreetDashboard = () => {
    const { apiBaseUrl } = useEnvironment();
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const styles = createStyles(theme);
    const branchId = useAppSelector(selectBranchId) || 0;

    const [tableStatus, setTableStatus] = useState<TypeTableStatus>({ f: 0, bp: 0, ot: 0 });
    const [reservationData, setReservationData] = useState<{ [key: string]: any }[]>([]);
    const [loader, setLoader] = useState<boolean>(false);
    const [fromToDates, setFromToDates] = useState({ from: moment().format("YYYY-MM-DD"), to: "" });
    const modelRef = useRef<ModalRefType | null>(null);
    const totalPax = reservationData.length > 0 ? reservationData.reduce((sum, item) => sum + (item.p || 0) + (item.noOfKids || 0), 0) : 0;

    const getTableStatus = async () => {
        const url = `${apiBaseUrl}tablestatebybranch?br_id=${branchId}`;
        const response = await makeAPIRequest(url, null, "GET");
        if (response) {
            setTableStatus(response);
        }
    };

    const refreshHandler = async () => {
        await getTableStatus();
    };

    useFocusEffect(
        useCallback(() => {
            getTableStatus();
            const intervalId = setInterval(async () => {
                getTableStatus();
            }, TABLE_REFRESH_INTERVAL);
            return () => clearInterval(intervalId);
        }, [branchId]));

    return (
        <View style={styles.container}>
            <TableStatusCards refreshHandler={refreshHandler} tableStatus={tableStatus} totalPax={totalPax} totalReservations={reservationData?.length} />
            <View style={[GlobalStyles.justifiedRow, { marginVertical: 15 }]}>
                <TouchableOpacity style={styles.buttonView} onPress={() => { navigate('Reports') }}>
                    <CustomText style={styles.btnText}>Reports</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonView]} onPress={() => { navigate('Reservations') }}>
                    <CustomText style={styles.btnText}>Reservations</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonView} onPress={() => { navigate('Reservation History') }}>
                    <CustomText style={styles.btnText}>History</CustomText>
                </TouchableOpacity>
            </View>
            <View style={styles.queueView}>
                <View style={[GlobalStyles.justifiedRow, { marginBottom: 10 }]}>
                    <CustomText style={styles.statusText}>Reservations</CustomText>
                    <TouchableOpacity style={[styles.dateTypeView, GlobalStyles.justifiedRow, styles.dateView]} onPress={() => { modelRef.current?.open('date') }}>
                        <Ionicons name="calendar-outline" size={isTablet ? 25 : 20} color={theme.colors.default} />
                        <View style={[GlobalStyles.justifiedRow, {}]}>
                            <CustomText style={{ marginLeft: isTablet ? 10 : 5, fontSize: theme.fontSize.small }} numberOfLines={1}>{moment(fromToDates?.from, "YYYY-MM-DD").format("DD MMM YYYY")} - {fromToDates.to ? moment(fromToDates?.to, "YYYY-MM-DD").format("DD MMM YYYY") : 'Onwards'}</CustomText>
                        </View>
                        <Ionicons name={"chevron-down"} size={15} color={'gray'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 10
    },
    buttonView: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 10,
        minWidth: isTablet ? '25%' : '30%',
        maxWidth: '55%',
        borderRadius: 10,
        borderColor: theme.colors.theme,
        backgroundColor: theme.colors.white
    },
    btnText: {
        color: theme.colors.theme,
        fontFamily: theme.fonts.Medium,
        fontSize: isTablet ? theme.fontSize.regular : theme.fontSize.small,
    },
    queueView: {
        flex: 1,
        borderTopWidth: 0.75,
        borderStyle: Platform.OS == "ios" ? "solid" : "dashed",
        borderTopColor: "lightgray",
        paddingTop: 15
    },
    text2: {
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
        fontFamily: theme.fonts.Medium
    },
    statusText: {
        fontFamily: theme.fonts.Medium,
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
    },
    dateTypeView: {
        backgroundColor: '#fff',
        padding: isTablet ? 5 : 3,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'lightgray'
    },
    dateView: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        width: isTablet ? '40%' : '60%',
        alignSelf: 'flex-start'
    },
});

export default GreetDashboard;


