import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Alert, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";

interface HiddenObjectViewProps {
    data: any;
    onCollect: (itemId: string) => Promise<any>;
    collectedItems: string[];
}

const HiddenObjectView: React.FC<HiddenObjectViewProps> = ({ data, onCollect, collectedItems }) => {
    
    const isCollected = (id: string) => collectedItems.includes(id);

    const handleItemPress = async (item: any) => {
        if (isCollected(item.id)) return;
        
        try {
            const res = await onCollect(item.id);
            if (res.success) {
                // Show popup or animation
                // For simplified view, we just rely on parent state update or local re-render
            }
        } catch (error) {
            console.log(error);
        }
    };

    const bgImage = data.backgroundImage ? { uri: data.backgroundImage } : undefined;

    return (
        <View style={styles.container}>
            <ImageBackground 
                source={bgImage} 
                style={styles.gameArea} 
                resizeMode="cover"
            >
               {/* 
                  If we had coordinates, we would place TouchableOpacity here 
                  For now, we just show the scene.
               */}
               <View style={styles.headerOverlay}>
                   <Text style={styles.instruction}>Find the objects listed below!</Text>
               </View>
            </ImageBackground>

            <View style={styles.trayContainer}>
                <Text style={styles.trayTitle}>Items to Find ({collectedItems.length}/{data.items?.length || 0})</Text>
                <ScrollView contentContainerStyle={styles.itemsGrid}>
                    {data.items?.map((item: any) => {
                        const collected = isCollected(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.itemCard, collected && styles.itemCollected]}
                                onPress={() => handleItemPress(item)}
                                disabled={collected}
                            >
                                <View style={styles.iconCircle}>
                                     {collected ? (
                                         <Ionicons name="checkmark" size={20} color="white" />
                                     ) : (
                                         <Ionicons name="search" size={20} color={COLORS.PRIMARY} />
                                     )}
                                </View>
                                <Text style={[styles.itemName, collected && styles.textCollected]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gameArea: {
         flex: 2, // Take up 2/3 of space
         width: '100%',
         justifyContent: 'center',
         alignItems: 'center'
    },
    headerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20
    },
    instruction: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    trayContainer: {
        flex: 1, // Take up 1/3 of space
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    trayTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.DARK,
        marginBottom: 12,
        alignSelf: 'center'
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center'
    },
    itemCard: {
        width: '45%', // 2 columns
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    itemCollected: {
        backgroundColor: COLORS.SUCCESS,
        borderColor: COLORS.SUCCESS,
        opacity: 0.8
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.DARK,
        flex: 1
    },
    textCollected: {
        color: 'white'
    }
});

export default HiddenObjectView;
