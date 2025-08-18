import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.2:3000';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

interface ItemFormData {
  name: string;
  type: string;
  color: string;
  dressCode: string;
  brand: string;
  material: string;
  image: string | null;
}

const ITEM_TYPES = [
  'Dress', 'Shirt', 'Jacket', 'Pants', 'Skirt', 'Sweater', 'T-Shirt',
  'Jeans', 'Shorts', 'Blouse', 'Cardigan', 'Hoodie', 'Tank Top', 'Other'
];

const DRESS_CODES = [
  'Casual', 'Business Casual', 'Business Formal', 'Formal', 'Semi-Formal',
  'Party', 'Athletic', 'Loungewear', 'Other'
];

const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    type: '',
    color: '',
    dressCode: '',
    brand: '',
    material: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDressCodePicker, setShowDressCodePicker] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      color: '',
      dressCode: '',
      brand: '',
      material: '',
      image: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Selected image URI:', asset.uri);
        
        if (Platform.OS === 'web') {
          // For web, handle the file directly
          setFormData(prev => ({
            ...prev,
            image: asset.uri,
          }));
        } else {
          // For mobile, handle base64 conversion if needed
          if (asset.uri.startsWith('data:')) {
            try {
              const filename = `image_${Date.now()}.jpg`;
              const fileUri = `${FileSystem.documentDirectory}${filename}`;
              
              // Extract base64 data
              const base64Data = asset.uri.split(',')[1];
              
              // Write base64 to file
              await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
              });
              
              console.log('Converted base64 to file:', fileUri);
              setFormData(prev => ({
                ...prev,
                image: fileUri,
              }));
            } catch (error) {
              console.error('Error converting base64 to file:', error);
              Alert.alert('Error', 'Failed to process image');
            }
          } else {
            // Use the URI directly if it's not base64
            setFormData(prev => ({
              ...prev,
              image: asset.uri,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name');
      return false;
    }
    if (!formData.type.trim()) {
      Alert.alert('Validation Error', 'Please select an item type');
      return false;
    }
    if (!formData.color.trim()) {
      Alert.alert('Validation Error', 'Please enter a color');
      return false;
    }
    if (!formData.image) {
      Alert.alert('Validation Error', 'Please select an image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('dressCode', formData.dressCode || '');
      formDataToSend.append('brand', formData.brand || '');
      formDataToSend.append('material', formData.material || '');

      // Handle image upload
      if (formData.image) {
        if (Platform.OS === 'web') {
          // For web, handle blob/file upload
          if (formData.image.startsWith('blob:')) {
            try {
              const response = await fetch(formData.image);
              const blob = await response.blob();
              const filename = `image_${Date.now()}.jpg`;
              
              // Create a File object from the blob
              const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
              formDataToSend.append('image', file);
              console.log('Web: Added file to form data:', filename);
            } catch (error) {
              console.error('Error processing web image:', error);
              Alert.alert('Error', 'Failed to process image for upload');
              return;
            }
          } else if (formData.image.startsWith('data:')) {
            // Handle base64 data on web
            try {
              const response = await fetch(formData.image);
              const blob = await response.blob();
              const filename = `image_${Date.now()}.jpg`;
              const file = new File([blob], filename, { type: 'image/jpeg' });
              formDataToSend.append('image', file);
              console.log('Web: Added base64 file to form data:', filename);
            } catch (error) {
              console.error('Error processing base64 image on web:', error);
              Alert.alert('Error', 'Failed to process image for upload');
              return;
            }
          }
        } else {
          // For mobile platforms
          if (formData.image.startsWith('data:')) {
            Alert.alert('Error', 'Please try selecting the image again');
            return;
          }

          const filename = formData.image.split('/').pop() || `image_${Date.now()}.jpg`;
          
          // Determine file type from filename or default to jpeg
          let type = 'image/jpeg';
          const fileExtension = filename.split('.').pop()?.toLowerCase();
          if (fileExtension) {
            switch (fileExtension) {
              case 'png':
                type = 'image/png';
                break;
              case 'jpg':
              case 'jpeg':
                type = 'image/jpeg';
                break;
              case 'gif':
                type = 'image/gif';
                break;
              case 'webp':
                type = 'image/webp';
                break;
              default:
                type = 'image/jpeg';
            }
          }

          // Create the file object for React Native
          const imageFile = {
            uri: Platform.OS === 'ios' ? formData.image.replace('file://', '') : formData.image,
            name: filename,
            type: type,
          };

          console.log('Mobile: Image file object:', imageFile);
          formDataToSend.append('image', imageFile as any);
        }
      }

      console.log('Submitting form data:', {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        dressCode: formData.dressCode,
        brand: formData.brand,
        material: formData.material,
        hasImage: !!formData.image,
        platform: Platform.OS,
        imageURI: formData.image?.substring(0, 50) + '...' // Truncate for logging
      });

      const response = await axios.post(`${API_BASE_URL}/items`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Item added successfully!');
        resetForm();
        onItemAdded();
      }
    } catch (error: any) {
      console.error('Error adding item:', error);
      
      let errorMessage = 'Failed to add item. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTypePicker = () => (
    <Modal visible={showTypePicker} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Item Type</Text>
            <TouchableOpacity onPress={() => setShowTypePicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {ITEM_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData(prev => ({ ...prev, type }));
                  setShowTypePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDressCodePicker = () => (
    <Modal visible={showDressCodePicker} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Dress Code</Text>
            <TouchableOpacity onPress={() => setShowDressCodePicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {DRESS_CODES.map((code) => (
              <TouchableOpacity
                key={code}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData(prev => ({ ...prev, dressCode: code }));
                  setShowDressCodePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Add New Item</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Image Picker */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>Photo *</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {formData.image ? (
                  <Image source={{ uri: formData.image }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera" size={40} color="#ccc" />
                    <Text style={styles.imagePickerText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowTypePicker(true)}
              >
                <Text style={[styles.selectText, !formData.type && styles.placeholderText]}>
                  {formData.type || 'Select item type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color *</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => setFormData(prev => ({ ...prev, color: text }))}
                placeholder="Enter color"
                placeholderTextColor="#999"
              />
            </View>

            {/* Dress Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dress Code</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowDressCodePicker(true)}
              >
                <Text style={[styles.selectText, !formData.dressCode && styles.placeholderText]}>
                  {formData.dressCode || 'Select dress code'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Brand */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                placeholder="Enter brand"
                placeholderTextColor="#999"
              />
            </View>

            {/* Material */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Material</Text>
              <TextInput
                style={styles.input}
                value={formData.material}
                onChangeText={(text) => setFormData(prev => ({ ...prev, material: text }))}
                placeholder="Enter material"
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {renderTypePicker()}
      {renderDressCodePicker()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imagePicker: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddItemModal;