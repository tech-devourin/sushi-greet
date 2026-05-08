import CustomText from '@components/CustomText';
import ModalHeader from '@components/molecules/ModalHeader';
import SubmitCancelButtons from '@components/molecules/SubmitCancelButtons';
import { isTablet } from '@utils/Constants';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';

interface PaxSetModalProps {
    table: any;
    closeModal: () => void;
    onSubmit: (pax: number) => void;
}

const PaxSetModal: React.FC<PaxSetModalProps> = ({ table, closeModal, onSubmit }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [selectedPax, setSelectedPax] = useState<number | null>(null);

    const paxOptions = [1, 2, 3, 4, 5, 6];

    return (
        <View style={styles.container}>
            <ModalHeader heading="Table Allocation" />

            <View style={styles.content}>
                <View style={styles.tableInfoCard}>
                    <CustomText style={styles.tableLabel}>TABLE</CustomText>
                    <CustomText style={styles.tableName}>{table?.name || table?.n}</CustomText>
                </View>

                <View style={styles.selectionSection}>
                    <CustomText style={styles.sectionTitle}>Select Number of People</CustomText>
                    <View style={styles.grid}>
                        {paxOptions.map((pax) => (
                            <TouchableOpacity
                                key={pax}
                                activeOpacity={0.7}
                                style={[
                                    styles.paxPill,
                                    selectedPax === pax && styles.selectedPaxPill
                                ]}
                                onPress={() => setSelectedPax(pax)}
                            >
                                <CustomText
                                    style={[
                                        styles.paxText,
                                        { color: selectedPax === pax ? '#fff' : '#424242' }
                                    ]}
                                >
                                    {pax}
                                </CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <SubmitCancelButtons
                        cancelText="Cancel"
                        cancelHandler={closeModal}
                        submitText="Print QR"
                        submitHandler={async () => {
                            if (selectedPax) {
                                onSubmit(selectedPax);
                            }
                        }}
                        disabledSubmit={!selectedPax}
                    />
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingBottom: 10,
    },
    content: {
        paddingHorizontal: 0,
        paddingTop: 20,
        alignItems: 'center',
    },
    tableInfoCard: {
        backgroundColor: theme.colors.background,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#b0b0b0'
    },
    tableLabel: {
        fontSize: theme.fontSize.xsmall,
        fontFamily: theme.fonts.Bold,
        color: theme.colors.grayDark,
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    tableName: {
        fontSize: theme.fontSize.headingX,
        fontFamily: theme.fonts.Bold,
        color: theme.colors.default,
    },
    selectionSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.Medium,
        color: theme.colors.grayDark,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        gap: 10,
    },
    paxPill: {
        width: isTablet ? 80 : 70,
        height: isTablet ? 65 : 55,
        borderRadius: 100, // Pill shape
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    selectedPaxPill: {
        borderColor: theme.colors.default,
        backgroundColor: theme.colors.default,
    },
    paxText: {
        fontSize: isTablet ? theme.fontSize.heading : theme.fontSize.large,
        fontFamily: theme.fonts.Bold,
    },
    selectedPaxText: {
        color: '#ffffff',
    },
    footer: {
        width: '100%',
        marginTop: 10,
    },
});

export default PaxSetModal;

