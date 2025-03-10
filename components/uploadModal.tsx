import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, TouchableOpacity, View, Text, StyleSheet, ViewStyle } from "react-native";

interface UploadModalProps {
    modalVisible: boolean;
    onBackPress: () => void;
    onCameraPress: () => void;
    onGalleryPress: () => void;
    onRemovePress: () => void;
    isLoading?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
    modalVisible,
    onBackPress,
    onCameraPress,
    onGalleryPress,
    onRemovePress,
    isLoading = false,
}) => {
    return (
        <Modal animationType="none" visible={modalVisible} transparent={true}>
            <Pressable style={styles.container} onPress={onBackPress}>
                {isLoading && <ActivityIndicator size={70} />}
                {!isLoading && (
                    <View style={styles.modalView}>
                        <Text style={{ marginBottom: 10 }}>Profile Photo</Text>
                        <View style={styles.decisionRow}>
                            <TouchableOpacity style={styles.optionButton} onPress={onCameraPress}>
                                <MaterialCommunityIcons name="camera-outline" size={30} />
                                <Text>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionButton} onPress={onGalleryPress}>
                                <MaterialCommunityIcons name="image-outline" size={30} />
                                <Text>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionButton} onPress={onRemovePress}>
                                <MaterialCommunityIcons name="trash-can-outline" size={30}/>
                                <Text>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    decisionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    optionButton: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
});

export default UploadModal;