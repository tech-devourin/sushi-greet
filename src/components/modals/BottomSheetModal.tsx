import { Ionicons } from '@expo/vector-icons';
import { useOrientation } from '@hooks/useOrientation';
import { isTablet } from '@utils/Constants';
import toastConfig from '@utils/ToastMessageConfiguration';
import { ModalRefType } from '@utils/Types';
import { BlurView } from 'expo-blur';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, Modal, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from 'src/context/ThemeContext';

type Props = {
    showCloseBtn?: boolean,
    avoidModalToast?: boolean,
    renderContent: (key: string | null) => React.ReactNode;
    onClose?: () => void;
}

const ModalAsBottomSheet = forwardRef<ModalRefType, Props>((props, ref) => {
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const isLandscape = useOrientation();
    const styles = createStyles(theme, SCREEN_HEIGHT, isLandscape);

    // UI state
    const [activeModal, setActiveModal] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [height, setHeight] = useState<any | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Animation values
    const translateY = useRef(new Animated.Value(1000)).current; // Default large value
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const renderedContent = useMemo(() => {
        if (!activeModal) return null;
        return props.renderContent(activeModal);
    }, [activeModal, props.renderContent]);

    const animateIn = () => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const animateOut = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            setActiveModal('');
            setHeight(null);
            callback?.();
            props.onClose?.();
        });
    };

    useImperativeHandle(ref, () => ({
        isOpen: (modal: string) => !!modal && activeModal === modal,
        open: (modalKey: string, heightVal?: any) => {
            setActiveModal(modalKey);
            setHeight(heightVal ?? null);
            setVisible(true);
            // Ensuring UI thread is ready
            requestAnimationFrame(() => {
                animateIn();
            });
        },
        close: () => {
            animateOut();
        },
        replace: (modalKey: string, heightVal?: any) => {
            Animated.timing(translateX, { toValue: -SCREEN_WIDTH, duration: 150, useNativeDriver: true }).start(() => {
                setHeight(heightVal ?? null);
                setActiveModal(modalKey);
                translateX.setValue(SCREEN_WIDTH);
                Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
            });
        }
    }));

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
            onRequestClose={() => animateOut()}
        >
            <View style={styles.modalContainer}>
                {/* Custom Backdrop */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        { opacity: backdropOpacity }
                    ]}
                >
                    <BlurView style={styles.absolute} tint="dark" experimentalBlurMethod="dimezisBlurView" />
                </Animated.View>
                {/* Content Container */}
                <View style={[styles.modalWrapper, { paddingBottom: keyboardHeight }]}>
                    {!props.avoidModalToast && (
                        <Toast position='top' config={toastConfig} topOffset={insets.top} visibilityTime={2000} />
                    )}
                    <Animated.View
                        style={[
                            styles.contentWrapper,
                            { transform: [{ translateY }] }
                        ]}
                    >
                        {props.showCloseBtn && (
                            <TouchableOpacity style={styles.closeBtn} onPress={() => animateOut()}>
                                <Ionicons name='close' size={isTablet ? 25 : 20} color={"#fff"} />
                            </TouchableOpacity>
                        )}

                        <View style={[styles.contentContainer, height && { height: height }, { width: isLandscape ? '50%' : isTablet ? '75%' : '100%' }]}>
                            <Animated.View style={[
                                { transform: [{ translateX }] },
                                styles.modalContent,
                                { paddingBottom: insets.bottom > 0 ? (isTablet ? 0 : insets.bottom) + (Platform.OS === 'ios' ? 0 : 10) : 10 },
                                height && { height: height, flex: 1 }
                            ]}>
                                {renderedContent || <Text>No Data provided</Text>}
                            </Animated.View>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>
    );
});

const createStyles = (theme: any, screenHeight: number, isLandscape: boolean) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropPressable: {
        flex: 1,
    },
    backdropOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentWrapper: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    modalContent: {
        overflow: 'hidden',
        backgroundColor: "#fff",
        maxHeight: screenHeight * 0.80,
        minHeight: 180,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingTop: 5
    },
    contentContainer: {
        alignSelf: 'center',
        maxHeight: screenHeight * 0.75,
        minHeight: 180,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomRightRadius: isTablet ? 15 : 0,
        borderBottomLeftRadius: isTablet ? 15 : 0,
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginBottom: isTablet ? 30 : 0,
    },
    absolute: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    closeBtn: {
        alignSelf: 'center',
        marginBottom: 10,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8
    },
    toastContainer: {
        position: 'absolute',
        top: -100,
        width: '100%',
        zIndex: 100,
    }
});

export default ModalAsBottomSheet;