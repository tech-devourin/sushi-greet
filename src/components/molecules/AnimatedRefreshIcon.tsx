import { Feather } from '@expo/vector-icons'
import { isTablet } from '@utils/Constants'
import { sleep } from '@utils/Helper'
import * as Haptics from 'expo-haptics'
import { FC } from 'react'
import { DimensionValue, TouchableOpacity } from 'react-native'
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { useTheme } from 'src/context/ThemeContext'

type Props = {
    getRefreshData: () => Promise<void>,
    color?: string,
    paddingRight?: DimensionValue
}

const AnimatedRefreshIcon: FC<Props> = ({ getRefreshData, color, paddingRight }) => {
    const { theme } = useTheme();
    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return { transform: [{ rotate: `${rotation.value}deg`, }], };
    });

    const handleRefresh = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        rotation.value = withRepeat(withTiming(360, { duration: 800 }), -1);
        try {
            await sleep(500);
            await getRefreshData();
        } catch (e) {
            console.error(e);
        } finally {
            cancelAnimation(rotation);
            rotation.value = 0;
        }
    };

    return (
        <TouchableOpacity onPress={handleRefresh} style={{ paddingRight: paddingRight ?? undefined }}>
            <Animated.View style={animatedStyle}>
                <Feather
                    name="refresh-cw"
                    size={isTablet ? 25 : 20}
                    color={color ?? theme.colors.grayDark}
                />
            </Animated.View>
        </TouchableOpacity>
    )
}

export default AnimatedRefreshIcon