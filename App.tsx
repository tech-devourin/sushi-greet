import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/Store';
import NavigationRoutes from './src/screens/Navigation';

import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {

    const onFetchUpdateAsync = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            console.log(`Error fetching latest Expo update`);
        }
    };

    useEffect(() => {
        onFetchUpdateAsync();
    }, []);

    return (
        <Provider store={store}>
            <ThemeProvider>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <SafeAreaProvider>
                    <NavigationRoutes />
                </SafeAreaProvider>
            </ThemeProvider>
        </Provider>
    );
}