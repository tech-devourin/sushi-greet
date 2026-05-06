import { FC } from "react";
import { Text, TextStyle } from "react-native";
import { FONTS } from "src/styles/Fonts";
import { useTheme } from "src/context/ThemeContext";

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

interface Props {
    variant?: Variant;
    fontFamily?: FONTS;
    color?: string,
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    onLayout?: (event: object) => void;
    onPress?: () => void,
    fontSize?: number,
    disabled?: boolean
}

const CustomText: FC<Props> = ({ variant, fontFamily, color, style, children, numberOfLines, onLayout, onPress, disabled, fontSize, ...props }) => {
    const { theme } = useTheme();
    return (
        <Text
            {...props}
            disabled={disabled}
            numberOfLines={numberOfLines}
            onLayout={onLayout}
            onPress={onPress}
            style={[
                {
                    color: color || theme.colors.text,
                    fontFamily: fontFamily || theme.fonts.Regular,
                    fontSize: fontSize,
                    includeFontPadding: false
                },
                style
            ]}
        >
            {children}
        </Text>
    );
};

export default CustomText;