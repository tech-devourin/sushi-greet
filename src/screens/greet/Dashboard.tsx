import CustomText from '@components/CustomText';
import Header from '@components/molecules/Header';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@redux/Hooks';
import { selectBranchId, setIsLoading } from '@redux/States';
import { useGlobalStyles } from '@styles/Styles';
import { isTablet, TABLE_REFRESH_INTERVAL, useEnvironment } from '@utils/Constants';
import { makeAPIRequest } from '@utils/Helper';
import { replace } from '@utils/NavigationUtil';
import { ModalRefType, TypeTableStatus } from '@utils/Types';
import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from "src/context/ThemeContext";
import TableStatusCards from './TableStatusCards';

const GreetDashboard = ({ navigation }: any) => {
    const { apiBaseUrl } = useEnvironment();
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const styles = createStyles(theme);
    const branchId = useAppSelector(selectBranchId) || 0;

    const [tableStatus, setTableStatus] = useState<TypeTableStatus>({ f: 0, bp: 0, ot: 0 });
    const [reservationData, setReservationData] = useState<{ [key: string]: any }[]>([]);
    const modelRef = useRef<ModalRefType | null>(null);
    const totalPax = reservationData.length > 0 ? reservationData.reduce((sum, item) => sum + (item.p || 0) + (item.noOfKids || 0), 0) : 0;

    const getTableStatus = async (firstLoad = false) => {
        firstLoad && dispatch(setIsLoading({ isLoading: true }));
        const url = `${apiBaseUrl}tablestatebybranch?br_id=${branchId}`;
        const response = await makeAPIRequest(url, null, "GET");
        if (response) {
            setTableStatus(response);
        }
        firstLoad && dispatch(setIsLoading({ isLoading: false }));
    };

    const refreshHandler = async () => {
        await getTableStatus(false);
    };

    useFocusEffect(
        useCallback(() => {
            getTableStatus(true);
            const intervalId = setInterval(async () => {
                getTableStatus(false);
            }, TABLE_REFRESH_INTERVAL);
            return () => clearInterval(intervalId);
        }, [branchId]));

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Header
                rightComponent={
                    <View style={[GlobalStyles.justifiedRow]}>
                        <TouchableOpacity onPress={() => { replace('Create Reservation') }} style={{ marginRight: 20, padding: 5 }}>
                            <Feather name="plus" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { modelRef.current?.open('logout') }} style={{ padding: 5 }}>
                            <Feather name="log-out" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                }
            />
            <View style={styles.container}>
                <TableStatusCards refreshHandler={refreshHandler} tableStatus={tableStatus} totalPax={totalPax} totalReservations={reservationData?.length} modelRef={modelRef} />
                <View style={styles.queueView}>
                    <View style={[GlobalStyles.justifiedRow]}>
                        <CustomText style={styles.statusText}>Queue is empty</CustomText>
                    </View>
                </View>
            </View>
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 25
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
        paddingTop: 25,
        marginTop: 25
    },
    text2: {
        fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium,
        fontFamily: theme.fonts.Medium
    },
    statusText: {
        fontFamily: theme.fonts.Medium,
        fontSize: isTablet ? theme.fontSize.heading : theme.fontSize.large,
        textAlign: 'center',
        width: '100%'
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


