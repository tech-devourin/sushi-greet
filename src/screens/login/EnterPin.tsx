import Logo from '@assets/icons/logo.png';
import Passlock from '@assets/images/passcode_lock.png';
import CustomText from '@components/CustomText';
import AlertModal from '@components/modals/AlertModal';
import ModalAsBottomSheet from '@components/modals/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useInitialDataFetch } from '@hooks/useInitialDataFetch';
import { useOrientation } from '@hooks/useOrientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserData } from '@redux/States';
import { replace, resetAndNavigateToModule } from '@utils/NavigationUtil';
import { ModalRefType } from '@utils/Types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from "src/context/ThemeContext";
import { useAppDispatch } from '../../redux/Hooks';
import { useGlobalStyles } from '../../styles/Styles';
import { isTablet, NETWORK_ERROR, useEnvironment } from '../../utils/Constants';
import { makeAPIRequestWithErrorHandling } from '../../utils/Helper';

const PinDot = memo(({ filled, value, isVisible }: { filled: boolean; value: string | undefined; isVisible: boolean }) => {
    const { theme } = useTheme();
    const scale = useSharedValue(1);
    const filledStatus = useSharedValue(filled ? 1 : 0);

    useEffect(() => {
        filledStatus.value = filled ? 1 : 0;
    }, [filled]);

    useAnimatedReaction(
        () => filledStatus.value,
        (current, previous) => {
            if (current === 1 && previous === 0) {
                scale.value = withSequence(
                    withTiming(1.5, { duration: 100, easing: Easing.out(Easing.cubic) }),
                    withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
                );
            }
        },
        [filledStatus]
    );

    const animatedScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const dotAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: filledStatus.value === 1 ? theme.colors.default : theme.colors.light_gray,
    }));

    const styles = createStyles(theme);

    return (
        <Animated.View style={[styles.dotCircle, { backgroundColor: theme.colors.light_gray }, animatedScaleStyle]}>
            {isVisible ? (
                <CustomText style={styles.circleText}>{value || ''}</CustomText>
            ) : (
                <Animated.View style={[styles.dotCircle, dotAnimatedStyle]} />
            )}
        </Animated.View>
    );
});

const EnterPinScreen = ({ route }: any) => {
    const { theme } = useTheme();
    const isLandscape = useOrientation();
    const styles = createStyles(theme);

    const GlobalStyles = useGlobalStyles();
    const { apiBaseUrl } = useEnvironment();
    const dispatch = useAppDispatch();
    const { callInitialSetUpAPIAsync, loading } = useInitialDataFetch(false);
    const [enteredNumber, setEnteredNumber] = useState<string>('');
    const [isPasscodeVisible, setIsPasscodeVisible] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
    const modelRef = useRef<ModalRefType | null>(null);

    const translateX = useSharedValue(0);

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const triggerShake = () => {
        translateX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const handleNumberPress = (num: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        if (enteredNumber?.length < 6) {
            setEnteredNumber(prev => prev + num);
        }
    };

    const handleDeletePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        setEnteredNumber(prev => prev.slice(0, -1));
    };

    const handleBackPress = () => {
        AsyncStorage.setItem("initialSetup", '');
        AsyncStorage.setItem("branchId", '');
        replace('IPconfig')
    };

    const handleSubmitPress = async () => {
        if (!enteredNumber) {
            Toast.show({ type: "warning", text1: "Please enter the passcode" });
            return
        }
        setLoader(true);
        const branchId = await AsyncStorage.getItem('branchId');
        const headers: RequestInit = {
            headers: {
                'Content-Type': "application/json",
                branchId: route.params?.branchId ?? branchId?.toString(),
                passcode: enteredNumber,
                source: 'CAPTAIN_PAD'
            }
        };
        const response = await makeAPIRequestWithErrorHandling(`${apiBaseUrl}loginstaffbypasscode`, {}, "POST", headers, false);
        if (response.statusCode == 200) {
            await AsyncStorage.setItem('loggedIn', JSON.stringify(response.data));
            dispatch(setUserData({ userData: response.data }));
            await callInitialSetUpAPIAsync();
            if (!loading) {
                await resetAndNavigateToModule('Dashboard');
            }
        } else if (response.statusCode == 412) {
            Toast.show({ type: "error", text1: "Invalid Passcode" });
            triggerShake();
        } else {
            Toast.show({ type: "error", text1: NETWORK_ERROR });
        }
        setLoader(false);
        setEnteredNumber('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ModalAsBottomSheet ref={modelRef} showCloseBtn renderContent={() => <AlertModal closeModal={() => { modelRef.current?.close() }} description={"Are you sure, you want to re-register device ? This will erase all data from app."} heading={"Re-Register"} onConfirm={handleBackPress} />} />
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={{ flex: 0.12, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                    <Image
                        source={Logo}
                        style={{ width: isLandscape ? '25%' : isTablet ? '50%' : '60%', height: '80%', resizeMode: 'contain' }}
                    />
                </View>
                <View style={[isLandscape ? styles.passlockLandscape : styles.passlock]}>
                    <Image
                        source={Passlock}
                        style={!isLandscape ? { width: isLandscape ? '15%' : '30%', marginTop: 0, resizeMode: 'contain' } : {}}
                    />
                </View>
                <View style={styles.pinView}>
                    <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.large} style={{ padding: 10 }}>Please Enter Your Passcode</CustomText>
                    <Animated.View style={[styles.circleContainer, { width: isLandscape ? '40%' : '60%' }, shakeStyle]}>
                        {[...Array(6)].map((_, index) => (
                            <PinDot
                                key={index}
                                filled={!!enteredNumber[index]}
                                value={enteredNumber[index]}
                                isVisible={isPasscodeVisible}
                            />
                        ))}
                    </Animated.View>
                </View>
                <View style={styles.innerContainer}>
                    <View style={[styles.row, { width: isTablet ? '50%' : '70%' }]}>
                        {['1', '2', '3'].map((num, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.numberButton, { width: isLandscape ? '12%' : '20%' }]}
                                onPress={() => handleNumberPress(num)}
                            >
                                <CustomText style={styles.numberText}>{num}</CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.row, { width: isTablet ? '50%' : '70%' }]}>
                        {['4', '5', '6'].map((num, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.numberButton, { width: isLandscape ? '12%' : '20%' }]}
                                onPress={() => handleNumberPress(num)}
                            >
                                <CustomText style={styles.numberText}>{num}</CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.row, { width: isTablet ? '50%' : '70%' }]}>
                        {['7', '8', '9'].map((num, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.numberButton, { width: isLandscape ? '12%' : '20%' }]}
                                onPress={() => handleNumberPress(num)}
                            >
                                <CustomText style={styles.numberText}>{num}</CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.row, { width: isTablet ? '50%' : '70%' }]}>
                        <View
                            style={[styles.numberButton, { borderColor: 'transparent', backgroundColor: 'transparent', width: isLandscape ? '12%' : '20%' }]}>
                            <CustomText fontFamily={theme.fonts.Medium}></CustomText>
                        </View>
                        <TouchableOpacity
                            style={[styles.numberButton, { width: isLandscape ? '12%' : '20%' }]}
                            onPress={() => handleNumberPress('0')}
                        >
                            <CustomText style={styles.numberText}>0</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.deleteButton, { width: isLandscape ? '12%' : '20%' }]}
                            onPress={handleDeletePress}
                        >
                            <Ionicons name="backspace-outline" size={isTablet ? 50 : 45} color={theme.colors.grayDark} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 0.15 }}>
                    <View style={[GlobalStyles.justifiedRow, { flex: 0.9, marginHorizontal: isLandscape ? 40 : 20 }]}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', }}
                            onPress={() => setIsPasscodeVisible(prev => !prev)}>
                            <CustomText style={{ fontSize: isTablet ? theme.fontSize.large : theme.fontSize.medium }} fontFamily={theme.fonts.Medium}>{isPasscodeVisible ? 'Hide Passcode' : 'Show Passcode'}</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[{ width: isLandscape ? '20%' : isTablet ? '30%' : '40%', borderRadius: 10 }]} onPress={handleSubmitPress} disabled={loader}>
                            <LinearGradient colors={[theme.colors.buttonGradient1, theme.colors.buttonGradient2]} style={[styles.button]}>
                                {loader ?
                                    <ActivityIndicator color={theme.colors.white} /> :
                                    <CustomText style={{ fontSize: isTablet ? theme.fontSize.heading : theme.fontSize.medium }} fontFamily={theme.fonts.SemiBold} color={theme.colors.white}>Submit</CustomText>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: isLandscape ? 0 : 15, justifyContent: 'center', alignItems: 'center', }}>
                        <TouchableOpacity onPress={() => { modelRef.current?.open('alert') }} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.text }}>
                            <CustomText>Re-Register Device</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        justifyContent: 'space-between',
    },
    passlockLandscape: {
        position: 'absolute',
        top: 10,
        right: -35,
        opacity: 0.5
    },
    passlock: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pinView: {
        flex: isTablet ? 0.15 : Platform.OS === 'ios' ? 0.18 : 0.1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        flex: isTablet ? 0.5 : Platform.OS === 'ios' ? 0.55 : 0.5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: isTablet ? 0 : Platform.OS === 'ios' ? 10 : 0,
    },
    languageText: {
        fontSize: 20,
        marginBottom: 20,
    },
    input: {
        borderBottomWidth: 1,
        padding: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 18,
        color: theme.colors.white
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberButton: {
        width: '25%',
        aspectRatio: 1,
        margin: 10,
        backgroundColor: theme.colors.lightGray2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'lightgray',
        borderRadius: 75
    },
    numberText: {
        fontFamily: theme.fonts.Medium,
        color: theme.colors.text,
        fontSize: isTablet ? theme.fontSize.heading : theme.fontSize.large,
    },
    circleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '70%',
        marginBottom: 20,
        marginTop: 10
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme.colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
    },
    dotCircle: {
        borderRadius: 25,
        borderColor: theme.colors.grayDark,
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20
    },
    circleText: {
        color: theme.colors.text,
        fontFamily: theme.fonts.Medium
    },
    deleteButton: {
        width: '25%',
        aspectRatio: 1,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: theme.colors.default,
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: isTablet ? 15 : 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.white,
    },
});

export default EnterPinScreen;

