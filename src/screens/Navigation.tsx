import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '@redux/Hooks';
import { selectIsLoading } from '@redux/States';
import toastConfig from '@utils/ToastMessageConfiguration';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';
import { navigationRef } from 'src/utils/NavigationUtil';
import { useGlobalStyles } from '../../src/styles/Styles';
import Dashboard from './greet/Dashboard';
import EnterPinScreen from './login/EnterPin';
import IPConfigScreen from './login/IPConfig';
import SplashScreen from './login/Splash';

const Stack = createStackNavigator();

const NavigationRoutes = () => {
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const width = Dimensions.get('window').width;
    const isLoading = useAppSelector(selectIsLoading)

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName="Splash">
                    <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="IPconfig" component={IPConfigScreen} options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="EnterPin" component={EnterPinScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false, animation: 'fade' }} />
                </Stack.Navigator>
            </NavigationContainer>
            {isLoading &&
                <View style={GlobalStyles.isLoading}>
                    <ActivityIndicator color={theme.colors.default} size={"large"} />
                </View>
            }
            <Toast position='top' config={toastConfig} topOffset={insets.top + (width * 0.1)} visibilityTime={2000} />
        </View>
    );
};

export default NavigationRoutes;