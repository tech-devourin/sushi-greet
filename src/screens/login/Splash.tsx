import Logo from '@assets/icons/app_icon.png';
import CustomText from "@components/CustomText";
import { useInitialDataFetch } from '@hooks/useInitialDataFetch';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch } from "@redux/Hooks";
import { setBranchId, setdbName, setipAddress, setUserData } from "@redux/States";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { replace, resetAndNavigate, resetAndNavigateToModule } from "src/utils/NavigationUtil";

import { useTheme } from "src/context/ThemeContext";

const SplashScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const dispatch = useAppDispatch();
    const { callInitialSetUpAPIAsync, loading } = useInitialDataFetch(true);
    const [storedData, setStoredData] = useState<{ [key: string]: any } | null>(null);
    const [minSplashTimeDone, setMinSplashTimeDone] = useState(false);
    const keys = ["initialSetup", "branchId", "loggedIn"];

    const rotation = useSharedValue(360);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    const fetchStoredData = async () => {
        const storeValues = await AsyncStorage.multiGet(keys);
        const data = Object.fromEntries(
            storeValues.map(([key, value]) => [key, value ? JSON.parse(value) : null])
        );
        return {
            initialSetup: data["initialSetup"],
            branchId: data["branchId"]?.toString(),
            loggedIn: data["loggedIn"],
            branchConfigs: data["branchconfigs"],
            applicationConfigs: data["applicationConfigs"],
        };
    };

    const updateReduxState = (data: any) => {
        const dbName = data.initialSetup.dbName.toLowerCase();
        dispatch(setdbName({ dbName: dbName })); // single dbName instead
        dispatch(setipAddress({ ipAddress: data?.initialSetup?.ipConfiguration || '' }));
        dispatch(setBranchId({ branchId: data?.branchId }));
        if (data.loggedIn) {
            dispatch(setUserData({ userData: data.loggedIn }));
        }
    };

    const handleNavigation = (data: any) => {
        if ((data.initialSetup && !data.loggedIn)) {
            replace("EnterPin");
        } else if (data.initialSetup && data.loggedIn) {
            resetAndNavigateToModule('Dashboard');
        } else {
            resetAndNavigate('IPconfig');
        }
    };

    const handleInitializeApp = async () => {
        const data = await fetchStoredData();
        setStoredData(data);
        if (data.initialSetup) {
            updateReduxState(data);
        }
    };

    useEffect(() => {
        handleInitializeApp();
        const timer = setTimeout(() => setMinSplashTimeDone(true), 2000);
        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        if (!loading && storedData && minSplashTimeDone) {
            handleNavigation(storedData);
        }
    }, [loading, storedData, minSplashTimeDone]);

    useEffect(() => {
        // logo animation
        rotation.value = withTiming(0, { duration: 1000 });
        scale.value = withTiming(1, { duration: 1000 });
        opacity.value = withTiming(1, { duration: 1000 });

        // text animation (delayed)
        textOpacity.value = withDelay(500, withTiming(1, { duration: 1000 }));
        textTranslateY.value = withDelay(500, withTiming(0, { duration: 1000 }));
    }, []);

    const pinwheelStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.Image source={Logo} style={[styles.logo, pinwheelStyle]} />
            <Animated.View style={textStyle}>
                <CustomText
                    fontFamily={theme.fonts.Bold}
                    color="#333333"
                    style={{ fontSize: theme.fontSize.headingXX }}
                >
                    Devourin
                </CustomText>
            </Animated.View>
            <Animated.View style={[styles.tagline, textStyle]}>
                <CustomText>Digitizing Restaurants Globally</CustomText>
            </Animated.View>
        </View>
    );
};

export default SplashScreen;

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: theme.device.width * 0.3,
        height: theme.device.width * 0.3,
        marginBottom: 10,
    },
    tagline: {
        marginTop: 5,
    },
});