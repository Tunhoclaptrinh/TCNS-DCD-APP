import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    year: number; // Hidden from user during sort
}

interface TimelineViewProps {
    data: any;
    onNext: () => void;
    onSubmit: (order: string[]) => Promise<{ isCorrect: boolean; pointsEarned: number }>;
}

const TimelineView: React.FC<TimelineViewProps> = ({ data, onNext, onSubmit }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    
    useEffect(() => {
        if (data && data.events) {
            // Shuffle or just load as provided? usually provided shuffled or explicitly unordered
            // Let's rely on data
            setEvents(data.events);
        }
    }, [data]);

    const handleSwap = (idx1: number, idx2: number) => {
        if (isSubmitted && isCorrect) return; // Locked if correct

        const newEvents = [...events];
        const temp = newEvents[idx1];
        newEvents[idx1] = newEvents[idx2];
        newEvents[idx2] = temp;
        setEvents(newEvents);
        setSelectedId(null);
    };

    const handlePress = (id: string, index: number) => {
        if (isSubmitted && isCorrect) return;

        if (selectedId === null) {
            setSelectedId(id);
        } else if (selectedId === id) {
            setSelectedId(null); // Deselect
        } else {
            // Swap
            const selectedIndex = events.findIndex(e => e.id === selectedId);
            if (selectedIndex !== -1) {
                handleSwap(selectedIndex, index);
            }
        }
    };

    const handleSubmit = async () => {
        const order = events.map(e => e.id);
        try {
            const res = await onSubmit(order);
            setIsSubmitted(true);
            setIsCorrect(res.isCorrect);
            
            if (res.isCorrect) {
                Alert.alert("Correct!", "You've arranged history correctly!", [
                    { text: "Continue", onPress: onNext }
                ]);
            } else {
                Alert.alert("Incorrect", "The timeline is not quite right. Try again!");
                // Keep isSubmitted true to show X or allow retry?
                // Actually if incorrect, we should allow retry immediately
                setIsSubmitted(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to submit timeline.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.instructionBox}>
                <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.instructionText}>
                    tap to select two events to swap them into the correct chronological order.
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {events.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.card,
                            selectedId === item.id && styles.selectedCard,
                            isCorrect && styles.correctCard
                        ]}
                        onPress={() => handlePress(item.id, index)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.line} />
                            <View style={[styles.dot, isCorrect && { backgroundColor: COLORS.SUCCESS }]} />
                             <View style={styles.line} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.description}</Text>
                            {isCorrect && <Text style={styles.year}>{item.year}</Text>}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {isCorrect ? (
                     <TouchableOpacity style={styles.submitButton} onPress={onNext}>
                        <Text style={styles.buttonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Check Timeline</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        margin: 16,
        overflow: 'hidden'
    },
    instructionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F0F9FF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        gap: 12
    },
    instructionText: {
        flex: 1,
        color: COLORS.DARK,
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedCard: {
        borderColor: COLORS.PRIMARY,
        backgroundColor: '#F0F9FF',
        transform: [{ scale: 1.02 }]
    },
    correctCard: {
        borderColor: COLORS.SUCCESS,
        backgroundColor: '#F0FFF4'
    },
    markerContainer: {
        alignItems: 'center',
        marginRight: 12,
        width: 20
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0'
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.GRAY,
        marginVertical: 4
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.DARK,
        marginBottom: 4
    },
    cardDesc: {
        fontSize: 13,
        color: COLORS.GRAY,
        lineHeight: 18
    },
    year: {
        marginTop: 4,
        fontWeight: 'bold',
        color: COLORS.SUCCESS,
        textAlign: 'right'
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    submitButton: {
        backgroundColor: COLORS.PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default TimelineView;
