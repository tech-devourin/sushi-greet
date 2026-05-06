import { useEffect, useState } from 'react';
import { EmitterSubscription, Keyboard, Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export default function useKeyboardOffsetHeight() {
    const keyboardOffset = useSharedValue(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        let showSub: EmitterSubscription | null = null;
        let hideSub: EmitterSubscription | null = null;

        const handleShow = (e: any) => {
            const height = e?.endCoordinates?.height ?? 0;
            const duration = Platform.OS === 'ios' ? e?.duration ?? 250 : 200;
            setKeyboardVisible(true);
            keyboardOffset.value = withTiming(height, { duration });
        };

        const handleHide = (e: any) => {
            const duration = Platform.OS === 'ios' ? e?.duration ?? 250 : 200;
            setKeyboardVisible(false);
            keyboardOffset.value = withTiming(0, { duration });
        };

        showSub = Keyboard.addListener(showEvent, handleShow);
        hideSub = Keyboard.addListener(hideEvent, handleHide);

        return () => {
            showSub?.remove();
            hideSub?.remove();
        };
    }, [keyboardOffset]);

    return { keyboardOffset, keyboardVisible };
}