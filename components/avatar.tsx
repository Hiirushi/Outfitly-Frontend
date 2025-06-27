import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet, View, Image, ImageStyle, ViewStyle } from "react-native";


const placeholder = require("../assets/images/placeholder.png");

interface AvatarProps {
    uri?: string;
    style?: ViewStyle;
    imgStyle?: ImageStyle;
    onPress?: () => void;
    onButtonPress?: () => void;
    aviOnly?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    uri,
    style,
    imgStyle,
    onPress,
    onButtonPress,
    aviOnly = false,
    ...props
}) => {
    return (
        <View style={style}>
            <TouchableOpacity onPress={onPress}>
                <Image 
                    source={uri ? { uri } : placeholder}
                    style={[styles.profilePicture, imgStyle,
                        aviOnly && { height: 35, width: 35, borderWidth: 0 }
                    ]}
                />
            </TouchableOpacity>
            {!aviOnly && (
                <TouchableOpacity onPress={onButtonPress}>
                    <MaterialCommunityIcons
                        name="camera-outline"
                        size={30}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Avatar;

const styles = StyleSheet.create({
    profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 100, 
        marginBottom: 1,
    },
});