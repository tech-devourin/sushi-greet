import Header from '@components/molecules/Header';
import { Feather } from '@expo/vector-icons';
import { useGlobalStyles } from '@styles/Styles';
import { isTablet } from '@utils/Constants';
import { replace } from '@utils/NavigationUtil';
import { ModalRefType } from '@utils/Types';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

const TableLayout = ({ navigation }: any) => {
    const { theme } = useTheme();
    const GlobalStyles = useGlobalStyles();
    const modelRef = useRef<ModalRefType | null>(null);



    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Header
                rightComponent={
                    <View style={[GlobalStyles.justifiedRow]}>
                        <TouchableOpacity onPress={() => { replace('Dashboard') }} style={{ marginRight: 20, padding: 5 }}>
                            <Feather name="home" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { modelRef.current?.open('logout') }} style={{ padding: 5 }}>
                            <Feather name="log-out" size={isTablet ? 30 : 25} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                }
            />
            <View>
                <Text>TableLayout</Text>
            </View>
        </View>
    )
}

export default TableLayout

const styles = StyleSheet.create({})