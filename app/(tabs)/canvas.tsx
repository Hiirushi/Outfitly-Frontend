import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Text,
  Animated,
  PanResponder,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemsPopUp from '@/components/itemsPopUp';
import WeatherWidget from '@/components/WeatherWidget';

interface DroppedItem {
  id: string;
  image: string;
  name: string;
  x: number;
  y: number;
}

export default function Canvas() {
  const [modalVisible, setModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleItemDrag = (item: any, gestureState: any) => {
    const modalHeight = screenHeight * 0.5;
    const canvasArea = screenHeight - modalHeight;

    // Check if item was dragged above the modal (to canvas area)
    if (gestureState.absoluteY < canvasArea + 50) {
      const newItem: DroppedItem = {
        id: item.id + '_' + Date.now(), // Make unique ID for multiple instances
        image: item.image,
        name: item.name,
        x: Math.max(10, Math.min(gestureState.absoluteX - 30, screenWidth - 70)), // Keep within bounds with padding
        y: Math.max(10, Math.min(gestureState.absoluteY - 30, canvasArea - 70)),
      };

      setDroppedItems((prev) => [...prev, newItem]);
      console.log('Item dropped:', newItem);
      console.log('All dropped items:', [...droppedItems, newItem]);
    }
  };

  const removeItem = (id: string) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemPosition = (id: string, newX: number, newY: number) => {
    setDroppedItems((prev) => prev.map((item) => (item.id === id ? { ...item, x: newX, y: newY } : item)));
  };

  const handleDone = () => {
    if (droppedItems.length === 0) {
      Alert.alert('No Items', 'Please add some items to your outfit before saving.');
      return;
    }
    setSaveModalVisible(true);
  };

  const handleSaveOutfit = () => {
    if (!outfitName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your outfit.');
      return;
    }

    // Here you would typically save to backend
    console.log('Saving outfit:', {
      name: outfitName,
      occasion: outfitOccasion,
      items: droppedItems,
    });

    Alert.alert('Success', 'Outfit saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Reset the form and close modal
          setOutfitName('');
          setOutfitOccasion('');
          setSaveModalVisible(false);
          // Optionally clear the canvas
          // setDroppedItems([]);
        },
      },
    ]);
  };

  const handleCancelSave = () => {
    setOutfitName('');
    setOutfitOccasion('');
    setSaveModalVisible(false);
  };

  const DraggableDroppedItem = ({ item }: { item: DroppedItem }) => {
    const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Set the offset to the current animated values
          pan.setOffset({
            x: item.x,
            y: item.y,
          });
          pan.setValue({ x: 0, y: 0 });

          Animated.spring(scale, {
            toValue: 1.1,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (evt, gestureState) => {
          // Calculate the final position
          const finalX = Math.max(10, Math.min(item.x + gestureState.dx, screenWidth - 70));
          const finalY = Math.max(10, Math.min(item.y + gestureState.dy, screenHeight * 0.5 - 70));

          // Update the item position in state
          updateItemPosition(item.id, finalX, finalY);

          // Reset the animated values
          pan.flattenOffset();
          pan.setValue({ x: finalX, y: finalY });

          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        },
      }),
    ).current;

    return (
      <Animated.View
        style={[
          styles.droppedItem,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.itemTouchable}>
          <Image source={{ uri: item.image }} style={styles.droppedItemImage} />
        </TouchableOpacity>

        {/* X button for removing the item */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Weather widget top-left */}
      <View style={styles.weatherWrap} pointerEvents="box-none">
        <WeatherWidget />
      </View>
      {/* Canvas area with dropped items */}
      <View style={styles.canvasArea}>
        {droppedItems.length === 0 && (
          <View style={styles.dropZoneHint}>
            <Ionicons name="arrow-down" size={24} color="#ccc" />
            <Text style={styles.dropZoneText}>Drag items here from the popup below</Text>
          </View>
        )}
        {droppedItems.map((item) => (
          <DraggableDroppedItem key={item.id} item={item} />
        ))}
      </View>

      <TouchableOpacity style={styles.add} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Done button - only show when there are items */}
      {droppedItems.length > 0 && (
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <ItemsPopUp onItemDrag={handleItemDrag} />
          </View>
        </View>
      </Modal>

      {/* Save Outfit Modal */}
      <Modal animationType="fade" transparent={true} visible={saveModalVisible} onRequestClose={handleCancelSave}>
        <View style={styles.saveModalOverlay}>
          <View style={styles.saveModalContent}>
            <Text style={styles.saveModalTitle}>Save Outfit</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={outfitName}
                onChangeText={setOutfitName}
                placeholder="Enter outfit name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Occasion</Text>
              <TextInput
                style={styles.textInput}
                value={outfitOccasion}
                onChangeText={setOutfitOccasion}
                placeholder="Enter occasion (optional)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.saveModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSave}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveOutfit}>
                <Text style={styles.saveButtonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  canvasArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    position: 'relative',
  },
  dropZoneHint: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  dropZoneText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  droppedItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  droppedItemImage: {
    width: 200,
    height: 200,
    borderRadius: 6,
  },
  removeButton: {
    position: 'absolute',
    top: -70,
    right: -20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    zIndex: 1,
  },
  add: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#545454',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  doneButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#80AE85',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  saveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  saveModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#80AE85',
    marginLeft: 10,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
  },
});
