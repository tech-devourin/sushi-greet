import LogoImage from '@assets/icons/app_icon.png';
import Logo from "@assets/icons/logo.png";
import CustomText from '@components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import useKeyboardOffsetHeight from '@hooks/useKeyboardOffsetHeight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBranchId, setdbName, setipAddress } from '@redux/States';
import { checkBranchValidity, makeAPIRequest, openExternalLink } from '@utils/Helper';
import { navigate, replace } from '@utils/NavigationUtil';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Network from 'expo-network';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../../redux/Hooks';
import { BASE_URL, isTablet, OTA_VERSION, useEnvironment } from '../../utils/Constants';

import { useTheme } from "src/context/ThemeContext";

const IPConfigScreen = ({ route }: any) => {
    const { theme } = useTheme();
    const dispatch = useAppDispatch();
    const { apiBaseUrl } = useEnvironment();
    const { top } = useSafeAreaInsets();
    const { keyboardOffset, keyboardVisible } = useKeyboardOffsetHeight();
    const inputRefs: any = {
        part1: useRef<TextInput>(null),
        part2: useRef<TextInput>(null),
        part3: useRef<TextInput>(null),
        part4: useRef<TextInput>(null),
        part5: useRef<TextInput>(null)
    };
    const [focusedInput, setFocusedInput] = useState<any>(null);
    const [ipAddress, setIpAddress] = useState({ part1: '', part2: '', part3: '', part4: '' });
    const [restaurantName, setRestaurantName] = useState('');
    const [branchOptions, setBranchOptions] = useState<{ [key: string]: any }[]>([]);
    const [loader, setLoader] = useState<boolean>(false);
    const [branchSelectionView, setBranchSelectionView] = useState<boolean>(false);
    const [selectedBranch, setSelectedBranch] = useState<{ [key: string]: any } | null>(null);
    const [dropDownValue, setDropDownValue] = useState<string | null>(null);
    const [dropdownSelection, setDropdownSelection] = useState<boolean>(false);
    const [currentLocalIp, setCurrentLocalIp] = useState<string>('');

    const handleChange = (text: string, part: string) => {
        setIpAddress((prev) => ({
            ...prev,
            [part]: text.trim(),
        }));
        if (text?.length === 3) {
            const nextPart = {
                part1: "part2",
                part2: "part3",
                part3: "part4",
                part4: "part5"
            }[part];
            if (nextPart) {
                inputRefs[nextPart].current?.focus();
            }
        }
    };

    const buildBaseUrl = (ipConfig: string, dbName: string) => `http://${ipConfig}:8080/${BASE_URL}${dbName.trim().toLowerCase()}/`;

    const saveSetupData = async (ipConfiguration: string, dbName: string, taxes: any) => {
        await AsyncStorage.multiSet([
            ["initialSetup", JSON.stringify({ ipConfiguration, dbName })],
            ["taxes", JSON.stringify(taxes)],
        ]);
        dispatch(setdbName({ dbName }));
        dispatch(setipAddress({ ipAddress: ipConfiguration }));
    };

    const saveBranchData = async (branchId: any, branchName: string) => {
        await AsyncStorage.multiSet([
            ["branchId", branchId],
            ["branchName", JSON.stringify(branchName)],
        ]);
        dispatch(setBranchId({ branchId }));
    };

    const initialSetupValidation = () => {
        let err = { id: '', text: '' };
        if (!ipAddress.part1 || !ipAddress.part2 || !ipAddress.part3 || !ipAddress.part4) {
            err = { id: 'ip', text: 'Please enter valid IP address' };
        } else if (!restaurantName) {
            err = { id: 'dbName', text: 'Please enter restaurant name' };
        }
        if (err.id !== '') {
            Toast.show({ type: "warning", text1: err.text })
            return false;
        } else {
            return true;
        }
    };

    const handleLoginPress = async () => {
        if (!initialSetupValidation()) return;
        const ipConfig = `${ipAddress.part1}.${ipAddress.part2}.${ipAddress.part3}.${ipAddress.part4}`;
        await getBranchDetails(ipConfig);
    };

    const getBranchDetails = async (ipConfiguration: string) => {
        const dbName = (route?.params?.dbName || restaurantName || '').trim().toLowerCase();
        const baseUrl = buildBaseUrl(ipConfiguration, dbName);
        setLoader(true);
        const headers: RequestInit = { headers: { "Content-Type": "application/json", app: dbName } };
        const errorMsg = "Invalid Configuration";
        const response = await makeAPIRequest(baseUrl + 'getBranchDetails', null, "GET", headers, errorMsg, false, undefined, false);
        setLoader(false);
        if (response) {
            const domainName = response.applicationDomain; //only if new server
            await saveSetupData(domainName ?? ipConfiguration, dbName, response.taxes);
            setBranchOptions(response.branches || []);
            if (response.branches?.length > 1) {
                setBranchSelectionView(true);
            } else {
                const branchId = response.branches?.[0].branchId?.toString();
                if (branchId && await checkBranchValidity(apiBaseUrl, branchId)) {
                    await saveBranchData(branchId, response.branches?.[0]?.branch);
                    Toast.show({ type: "success", text1: 'Device Configured Successfully' });
                    replace('EnterPin', response.branches[0]);
                }
            }
        }
    };

    const handleBranchSelection = (selectedBranchName: string) => {
        const branch = branchOptions.find(b => b.branch === selectedBranchName) || null;
        setSelectedBranch(branch);
        setDropDownValue(branch?.branch || null);
    };

    const handleBranchSubmit = async () => {
        if (!dropDownValue) {
            return Toast.show({ type: "warning", text1: "Please Select Branch" });
        }
        const branchId: any = selectedBranch?.branchId.toString();
        if (!branchId) return;
        if (await checkBranchValidity(apiBaseUrl, branchId)) {
            await saveBranchData(branchId, selectedBranch?.branch ?? '');
            setBranchSelectionView(false);
            await navigate('EnterPin', selectedBranch);
            Toast.show({ type: "success", text1: 'Device Configured Successfully' });
        }
    };

    useEffect(() => {
        const fetchWifiDetails = async () => {
            try {
                const ipAddress = await Network.getIpAddressAsync();
                setCurrentLocalIp(ipAddress ?? '');
            } catch (error) {
                console.error("Error fetching Wi-Fi details:", error);
            }
        };
        fetchWifiDetails();
        setTimeout(() => {
            inputRefs.part1.current?.focus();
            setFocusedInput('part1');
        }, 0);
    }, []);

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            {branchSelectionView && <TouchableOpacity style={[{ top: top }, styles.bgBtn]} onPress={() => { setBranchSelectionView(false) }} >
                <Ionicons name="chevron-back" size={isTablet ? 30 : 25} />
            </TouchableOpacity>
            }
            <Image source={LogoImage} style={styles.bgLogo} />
            <CustomText style={styles.version}>v{Constants.expoConfig?.version}_{OTA_VERSION}</CustomText>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Image source={Logo} style={styles.image} />
                    <View style={[styles.centerView]}>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.headingX}>Initial Setup</CustomText>
                        <CustomText fontSize={theme.fontSize.large} style={{ marginTop: 5 }}>Connected Wifi {`<${currentLocalIp}>`}</CustomText>
                        <View style={{ flex: 1, width: '100%', marginVertical: 25 }}>
                            {branchSelectionView ?
                                <Animated.View style={{ marginTop: 30, marginBottom: '40%', height: '100%' }} entering={FadeInRight.duration(500)}>
                                    <CustomText fontFamily={theme.fonts.Regular} fontSize={theme.fontSize.large}>Select Restaurant Branch</CustomText>
                                    <View style={[styles.dropdownContainer]}>
                                        <Dropdown
                                            activeColor={theme.colors.theme_light}
                                            style={styles.dropdown}
                                            data={branchOptions.map(branch => ({ label: branch.branch, value: branch.branch }))}
                                            placeholder="Select Branch"
                                            placeholderStyle={styles.dropdownText}
                                            selectedTextStyle={styles.dropdownText}
                                            value={dropDownValue}
                                            onFocus={() => { setDropdownSelection(true) }}
                                            onBlur={() => { setDropdownSelection(false) }}
                                            onChange={item => handleBranchSelection(item.value)}
                                            renderRightIcon={() => (
                                                <Ionicons name="chevron-down" color={theme.colors.text} size={isTablet ? 25 : 20} style={{ transform: [{ rotate: dropdownSelection ? '180deg' : '0deg' }] }} />
                                            )}
                                            labelField={'label'}
                                            valueField={'label'} />
                                    </View>
                                </Animated.View>
                                :
                                <View>
                                    <View style={{ marginVertical: 30 }}>
                                        <CustomText fontFamily={theme.fonts.Regular} fontSize={theme.fontSize.large}>IP Configuration</CustomText>
                                        <View style={styles.ipContainer}>
                                            {["part1", "part2", "part3", "part4"].map((part: string, index: number) => (
                                                <View key={index} style={[{ width: isTablet ? '15%' : '23%' }, styles.boxView, focusedInput === part && styles.focusedInput]}>
                                                    <TextInput
                                                        value={ipAddress[part as 'part1']}
                                                        key={part}
                                                        ref={inputRefs[part]}
                                                        style={[styles.ipInput,]}
                                                        keyboardType="number-pad"
                                                        maxLength={3}
                                                        submitBehavior='submit'
                                                        onFocus={() => setFocusedInput(part)}
                                                        onBlur={() => setFocusedInput(null)}
                                                        onChangeText={(text) => handleChange(text, part)}
                                                        returnKeyType='next'
                                                        onSubmitEditing={() => {
                                                            const nextPart = `part${index + 2}`;
                                                            if (inputRefs[nextPart]?.current) {
                                                                inputRefs[nextPart].current.focus();
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={{ marginBottom: 30 }}>
                                        <CustomText fontFamily={theme.fonts.Regular} fontSize={theme.fontSize.large}>Restaurant Name</CustomText>
                                        <View style={[styles.boxView, { marginTop: 10 }, focusedInput === 'part5' && styles.focusedInput]}>
                                            <TextInput
                                                onFocus={() => setFocusedInput('part5')}
                                                ref={inputRefs['part5']}
                                                style={[styles.textInput]}
                                                autoCapitalize='none'
                                                placeholder="Enter Restaurant Name"
                                                placeholderTextColor={theme.colors.lightGray1}
                                                value={restaurantName || ''}
                                                onChangeText={(text) => setRestaurantName(text)}
                                                onSubmitEditing={handleLoginPress}
                                                returnKeyType='done'
                                            />
                                        </View>
                                    </View>
                                </View>
                            }
                        </View>
                        <TouchableOpacity onPress={branchSelectionView ? handleBranchSubmit : handleLoginPress} style={{ width: '100%' }}>
                            <LinearGradient colors={[theme.colors.buttonGradient1, theme.colors.buttonGradient2]} style={{ height: 50, alignItems: 'center', borderRadius: 10, justifyContent: 'center' }}>
                                {loader ?
                                    <ActivityIndicator color={theme.colors.white} /> :
                                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.large} color={theme.colors.white}>Proceed</CustomText>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {(Platform.OS == 'ios' || !keyboardVisible) && <View style={styles.bottomBar}>
                <CustomText fontSize={theme.fontSize.small}>By continuing, you agree to our</CustomText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText style={styles.footerText} onPress={() => { openExternalLink("https://devourin.com/privacy/") }}>Terms of Service</CustomText>
                    <CustomText style={styles.footerText} onPress={() => { openExternalLink("https://devourin.com/privacy/") }}>Privacy Policy</CustomText>
                </View>
            </View>}
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    image: {
        width: theme.device.width * 0.8,
        height: theme.device.width * 0.2,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    bottomBar: {
        position: 'absolute',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%',
        bottom: 10
    },
    textInput: {
        fontSize: theme.fontSize.medium,
        padding: 15,
        borderRadius: 8,
        backgroundColor: theme.colors.lightGray2
    },
    ipContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    ipInput: {
        borderRadius: 8,
        backgroundColor: theme.colors.lightGray2,
        padding: isTablet ? 15 : 15,
        textAlign: 'center',
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.Regular,
        includeFontPadding: false,
    },
    dropdownContainer: {
        marginTop: 10,
        width: isTablet ? '80%' : '100%',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: theme.colors.theme,
        padding: 3
    },
    dropdown: {
        paddingHorizontal: 10,
        height: isTablet ? 60 : 50,
        borderRadius: 8,
        backgroundColor: theme.colors.lightGray2
    },
    dropdownText: {
        color: theme.colors.text,
        padding: 10,
        fontFamily: theme.fonts.Regular,
        includeFontPadding: false
    },
    shadow: {
        backgroundColor: theme.colors.white,
        shadowColor: theme.colors.text,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    focusedInput: {
        borderColor: theme.colors.theme,
    },
    centerView: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        width: isTablet ? '80%' : '100%',
        alignItems: 'center',
    },
    bgLogo: {
        position: 'absolute',
        width: theme.device.width * 0.6,
        height: theme.device.width * 0.6,
        top: 0,
        right: -theme.device.width * 0.3,
        opacity: 0.15,
    },
    bgBtn: {
        position: 'absolute',
        marginTop: 10,
        marginHorizontal: 10,
        padding: 5,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        borderRadius: 40,
        alignSelf: 'flex-start',
        zIndex: 10
    },
    scrollContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        flexGrow: 1,
        paddingBottom: 10,
        paddingTop: theme.device.height * 0.08
    },
    boxView: {
        padding: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.white
    },
    footerText: {
        textDecorationLine: 'underline',
        marginHorizontal: 5,
        fontSize: theme.fontSize.small
    },
    version: {
        fontSize: theme.fontSize.extraSmall,
        position: 'absolute',
        top: theme.device.height * 0.05,
        paddingHorizontal: 5,
        color: 'gray',
        right: 0
    }
});

export default IPConfigScreen;

