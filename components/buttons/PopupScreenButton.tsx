import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PopupScreenButtonProps {
    type: string;
}

const PopupScreenButton: React.FC<PopupScreenButtonProps> = ({ type }) => {
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>{type}</Text>
            </TouchableOpacity>
        </View>
    );
}
export default PopupScreenButton;

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 10,
        
    },
    button: {
        backgroundColor: '#E9E2D7',
        padding: 10,
        width: 50,
        height: 50,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#5A5A5A',
        fontSize: 12,
        fontWeight: 'bold',
        
    },
});