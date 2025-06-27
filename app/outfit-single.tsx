import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { outfitDataset } from "@/constants/datasets/outfitDataset";

const OutfitSingle = () => {
    const { id } = useLocalSearchParams();

    console.log("OutfitSingle id:", id);

    const outfit = outfitDataset.outfits.find(outfit => outfit.id === id);

    if (!outfit) {
        return (
          <View style={styles.container}>
            <Text style={styles.errorText}>Outfit not found!</Text>
          </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={outfit.image_url} style={styles.image} />
            <Text style={styles.name}>{outfit.name}</Text>
            <View style={styles.detailsContainer}>
                <View style={styles.row}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{outfit.name}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    detailsContainer: {
        width: '100%',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        color: '#666',
    },
    itemsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    item: {
        width: "30%",
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    itemType: {
        fontSize: 14,
        color: "#888",
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginTop: 20,
    },
});

export default OutfitSingle;