import React, { useState, useEffect } from 'react';
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
  Switch,
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
  typeId: string;
  color: string;
  dressCode: string;
  brand: string;
  material: string;
  image: string | null;
  removeBg: boolean; // New field for background removal
}

interface ItemType {
  _id: string;
  name: string;
}

const DRESS_CODES = [
  'Casual',
  'Business Casual',
  'Business Formal',
  'Formal',
  'Semi-Formal',
  'Party',
  'Athletic',
  'Beachwear',
  'Other',
];

const COLORS = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Black',
  'White',
  'Gray',
  'Brown',
  'Pink',
  'Purple',
  'Orange',
  'Beige',
];

const MATERIALS = [
  'Cotton',
  'Linen',
  'Silk',
  'Wool',
  'Polyester',
  'Nylon',
  'Denim',
  'Leather',
  'Velvet',
  'Satin',
  'Chiffon',
  'Other',
];

const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    type: '',
    typeId: '',
    color: '',
    dressCode: '',
    brand: '',
    material: '',
    image: null,
    removeBg: true, // Default to true for background removal
  });
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDressCodePicker, setShowDressCodePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [types, setTypes] = useState<ItemType[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch types when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchItemTypes();
    }
  }, [visible]);

  const fetchItemTypes = async (): Promise<void> => {
    try {
      setTypesLoading(true);
      setError(null);
      const response = await axios.get<ItemType[]>(`${API_BASE_URL}/itemType`);
      setTypes(response.data);
    } catch (err) {
      console.error('Error fetching types:', err);
      setError('Failed to load item types. Please try again.');
      Alert.alert('Error', 'Failed to load item types. Please try again.');
    } finally {
      setTypesLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      typeId: '',
      color: '',
      dressCode: '',
      brand: '',
      material: '',
      image: null,
      removeBg: true,
    });
    setError(null);
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
          setFormData((prev) => ({
            ...prev,
            image: asset.uri,
          }));
        } else {
          if (asset.uri.startsWith('data:')) {
            try {
              const filename = `image_${Date.now()}.jpg`;
              const fileUri = `${FileSystem.documentDirectory}${filename}`;

              const base64Data = asset.uri.split(',')[1];
              await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
              });

              console.log('Converted base64 to file:', fileUri);
              setFormData((prev) => ({
                ...prev,
                image: fileUri,
              }));
            } catch (error) {
              console.error('Error converting base64 to file:', error);
              Alert.alert('Error', 'Failed to process image');
            }
          } else {
            setFormData((prev) => ({
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
    if (!formData.typeId.trim()) {
      Alert.alert('Validation Error', 'Please select an item type');
      return false;
    }
    if (!formData.color.trim()) {
      Alert.alert('Validation Error', 'Please select a color');
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
      formDataToSend.append('itemType', formData.typeId);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('dressCode', formData.dressCode || '');
      formDataToSend.append('brand', formData.brand || '');
      formDataToSend.append('material', formData.material || '');
      formDataToSend.append('removeBg', formData.removeBg.toString()); // Add background removal flag

      // Handle image upload
      if (formData.image) {
        if (Platform.OS === 'web') {
          if (formData.image.startsWith('blob:')) {
            try {
              const response = await fetch(formData.image);
              const blob = await response.blob();
              const filename = `image_${Date.now()}.jpg`;
              const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
              formDataToSend.append('image', file);
              console.log('Web: Added file to form data:', filename);
            } catch (error) {
              console.error('Error processing web image:', error);
              Alert.alert('Error', 'Failed to process image for upload');
              return;
            }
          } else if (formData.image.startsWith('data:')) {
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
          if (formData.image.startsWith('data:')) {
            Alert.alert('Error', 'Please try selecting the image again');
            return;
          }

          const filename = formData.image.split('/').pop() || `image_${Date.now()}.jpg`;
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
        itemType: formData.typeId,
        color: formData.color,
        dressCode: formData.dressCode,
        brand: formData.brand,
        material: formData.material,
        removeBg: formData.removeBg, // Log background removal setting
        hasImage: !!formData.image,
        platform: Platform.OS,
      });

      const response = await axios.post(`${API_BASE_URL}/items`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.status === 201 || response.status === 200) {
        const successMessage =
          formData.removeBg && response.data.backgroundRemoved
            ? 'Item added successfully with background removed!'
            : 'Item added successfully!';

        Alert.alert('Success', successMessage);
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

      // Special handling for background removal errors
      if (errorMessage.includes('remove background') || errorMessage.includes('Remove.bg')) {
        errorMessage += '\nTry turning off background removal or check your internet connection.';
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
            {typesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Loading types...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchItemTypes} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              types.map((typeObj) => (
                <TouchableOpacity
                  key={typeObj._id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      type: typeObj.name,
                      typeId: typeObj._id,
                    }));
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{typeObj.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderColorPicker = () => (
    <Modal visible={showColorPicker} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Color</Text>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, color: color }));
                  setShowColorPicker(false);
                }}
              >
                <View style={styles.colorPickerItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: color.toLowerCase() }]} />
                  <Text style={styles.pickerItemText}>{color}</Text>
                </View>
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
                  setFormData((prev) => ({ ...prev, dressCode: code }));
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

  const renderMaterialPicker = () => (
    <Modal visible={showMaterialPicker} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Material</Text>
            <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {MATERIALS.map((material) => (
              <TouchableOpacity
                key={material}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, material: material }));
                  setShowMaterialPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{material}</Text>
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

              {/* Background Removal Toggle */}
              <View style={styles.toggleSection}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Remove Background</Text>
                    <Text style={styles.toggleDescription}>Automatically remove background from your image</Text>
                  </View>
                  <Switch
                    value={formData.removeBg}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, removeBg: value }))}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={formData.removeBg ? '#007AFF' : '#f4f3f4'}
                  />
                </View>
                {formData.removeBg && (
                  <Text style={styles.toggleNote}>Background removal may take a few extra seconds</Text>
                )}
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type *</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setShowTypePicker(true)}>
                <Text style={[styles.selectText, !formData.type && styles.placeholderText]}>
                  {formData.type || 'Select item type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color *</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setShowColorPicker(true)}>
                <View style={styles.colorPickerButton}>
                  {formData.color && (
                    <View style={[styles.colorSwatch, { backgroundColor: formData.color.toLowerCase() }]} />
                  )}
                  <Text style={[styles.selectText, !formData.color && styles.placeholderText]}>
                    {formData.color || 'Select color'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Dress Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dress Code</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setShowDressCodePicker(true)}>
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
                onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
                placeholder="Enter brand"
                placeholderTextColor="#999"
              />
            </View>

            {/* Material */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Material</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setShowMaterialPicker(true)}>
                <Text style={[styles.selectText, !formData.material && styles.placeholderText]}>
                  {formData.material || 'Select material'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {renderTypePicker()}
      {renderColorPicker()}
      {renderDressCodePicker()}
      {renderMaterialPicker()}
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
  toggleSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  toggleNote: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    fontStyle: 'italic',
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
  colorPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddItemModal;
