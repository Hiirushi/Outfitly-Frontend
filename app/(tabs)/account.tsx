import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from "expo-image-picker";
import Avatar from '@/components/avatar';
import UploadModal from '@/components/uploadModal';

export default function Account() {
    const [image, setImage] = useState<{ uri: string } | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const uploadDp = async (mode?: string) => {
        try {
            let result: ImagePicker.ImagePickerResult;

            if (mode === "gallery") {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            } else {
                await ImagePicker.requestCameraPermissionsAsync();
                result = await ImagePicker.launchCameraAsync({
                    cameraType: ImagePicker.CameraType.front,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            }

            if (!result.canceled) {
                await saveImage({ uri: result.assets[0].uri });
            }
        } catch (error) {
            console.log(error);
            setModalVisible(false);
        }
    };

    const removeImage = async () => {
        try {
            saveImage(null);
        } catch (message) {
            alert(message);
            setModalVisible(false);
        }
    };

    const saveImage = async (image: { uri: string } | null) => {
        try {
            setImage(image);
            setModalVisible(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Avatar
                uri={image?.uri}
                onButtonPress={() => setModalVisible(true)}
            />
            <UploadModal
                modalVisible={modalVisible}
                onBackPress={() => setModalVisible(false)}
                onCameraPress={() => uploadDp("camera")}
                onGalleryPress={() => uploadDp("gallery")}
                onRemovePress={() => removeImage()}
            />
            <Text style={styles.name}>Alisson</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Feather name="edit" size={24} color="black" />
                    <Text style={styles.edit}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <MaterialIcons name="logout" size={24} color="red" />
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    buttonContainer: {
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        padding: 10,
        elevation: 2,
    },
    edit: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
    },
    logout: {
        color: '#c90000',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
