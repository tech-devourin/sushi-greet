import Logo from '@assets/icons/devourin_icon.png';
import SushiLogo from '@assets/images/sushi_plus.png';
import { isTablet } from '@utils/Constants';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { useTheme } from 'src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeaderProps {
    rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ rightComponent }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles(theme, insets);

    const headerHeight = 60 + insets.top;
    const bulgeWidth = isTablet ? 160 : 120;
    const bulgeHeight = isTablet ? 50 : 45;

    // SVG path for a rectangle with a central bulge
    const path = `
        M 0 0
        H ${SCREEN_WIDTH}
        V ${headerHeight}
        H ${SCREEN_WIDTH / 2 + bulgeWidth / 2}
        A ${bulgeWidth / 2} ${bulgeHeight} 0 0 1 ${SCREEN_WIDTH / 2 - bulgeWidth / 2} ${headerHeight}
        H 0
        V 0
        Z
    `;

    return (
        <View style={styles.headerContainer}>
            <View style={StyleSheet.absoluteFill}>
                <Svg height={headerHeight + bulgeHeight + 20} width={SCREEN_WIDTH}>
                    <Defs>
                        <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor={theme.colors.buttonGradient1} stopOpacity="1" />
                            <Stop offset="1" stopColor={theme.colors.buttonGradient2} stopOpacity="1" />
                        </SvgGradient>
                    </Defs>
                    <Path d={path} fill="url(#grad)" />
                </Svg>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.leftContainer}>
                    <Image
                        source={SushiLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.centerContainer}>
                    <Image source={Logo}
                        style={styles.centerLogo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.rightContainer}>
                    {rightComponent}
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    headerContainer: {
        zIndex: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: insets.top + 10,
        paddingBottom: 20,
        paddingHorizontal: 15,
    },
    leftContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top + 30,
        zIndex: 5,
        pointerEvents: 'none',
    },
    logo: {
        width: isTablet ? 120 : 100,
        height: 30,
        tintColor: '#fff'
    },
    centerLogo: {
        width: isTablet ? 90 : 70,
        height: isTablet ? 90 : 70,
        tintColor: '#fff'
    },
    rightContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

export default Header;
