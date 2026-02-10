import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "@/src/store";
import { startLevelSession, updateCurrentScreen, resetSession } from "@/src/store/slices/gameSlice";
import { GameService } from "@/src/services/game.service";
import { COLORS } from "@/src/styles/colors";
import HiddenObjectView from "./components/HiddenObjectView";
import QuizView from "./components/QuizView";
import TimelineView from "./components/TimelineView";

const GamePlayScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<any>();
    const { levelId } = route.params || {};

    const { currentSession, currentScreen, loading, error } = useSelector((state: RootState) => state.game);
    const [actionLoading, setActionLoading] = useState(false);
    const [localCollectedItems, setLocalCollectedItems] = useState<string[]>([]);

    useEffect(() => {
        if (currentSession?.collectedItems) {
            setLocalCollectedItems(currentSession.collectedItems);
        }
    }, [currentSession]);

    useEffect(() => {
        if (levelId) {
            dispatch(startLevelSession(levelId));
        }
        return () => {
            dispatch(resetSession());
        };
    }, [levelId, dispatch]);

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error, [{ text: "Go Back", onPress: () => navigation.goBack() }]);
        }
    }, [error, navigation]);

    const handleNextScreen = async () => {
        if (!currentSession?.id) return;
        setActionLoading(true);
        try {
            const response = await GameService.nextScreen(currentSession.id);
            if (response.success) {
                if (response.data.finished) {
                    // Level Completed
                    Alert.alert("Level Completed!", `Score: ${response.data.totalScore}`, [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                } else {
                    dispatch(updateCurrentScreen(response.data.nextScreen));
                }
            } else {
                Alert.alert("Error", response.message || "Failed to go to next screen");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCollectItemWrapper = async (itemId: string) => {
        if (!currentSession?.id) return;
        try {
            const response = await GameService.collectClue(currentSession.level.id, itemId);
            if (response.success) {
                Alert.alert("Found!", `${response.data.item.name}: ${response.data.item.factPopup}`);
                setLocalCollectedItems(prev => [...prev, itemId]);
                return response;
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleQuizSubmit = async (answerId: string) => {
        if (!currentSession) return;
        return await GameService.submitAnswer(currentSession.id, answerId);
    };

    const handleTimelineSubmit = async (order: string[]) => {
        if (!currentSession) throw new Error("No session");
        const res = await GameService.submitTimeline(currentSession.id, order);
        if (!res.data) throw new Error("No data returned");
        return res.data; 
    };

    if (loading && !currentSession) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={{ marginTop: 10, color: COLORS.GRAY }}>Starting Game...</Text>
            </View>
        );
    }

    if (!currentSession || !currentScreen) {
        return (
            <View style={styles.centerContainer}>
                <Text>Initializing...</Text>
            </View>
        );
    }

    /* ================= RENDER LOGIC ================= */

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{currentSession.level.name}</Text>
            <View style={styles.scoreContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.scoreText}>{currentSession.score || 0}</Text>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (currentScreen.type) {
            case 'HIDDEN_OBJECT':
                return (
                    <HiddenObjectView 
                        data={currentScreen} 
                        onCollect={handleCollectItemWrapper}
                        collectedItems={localCollectedItems}
                    />
                );
            case 'QUIZ':
                return (
                    <QuizView 
                        data={currentScreen} 
                        onSubmit={handleQuizSubmit}
                        onNext={handleNextScreen}
                    />
                );
            case 'TIMELINE':
                return (
                    <TimelineView 
                        data={currentScreen} 
                        onSubmit={handleTimelineSubmit}
                        onNext={handleNextScreen}
                    />
                );
            default:
                return (
                    <View style={styles.centerContainer}>
                        <Text style={{color: 'white'}}>Unknown Screen Type: {currentScreen.type}</Text>
                        <Button title="Skip" onPress={handleNextScreen} />
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            
            <View style={styles.content}>
                {renderContent()}
            </View>

            {/* Footer is now handled inside specific Views like Timeline and Quiz for specific actions. 
                For Hidden Object, we might want a global "Next" button if they find everything? 
                Actually, usually Hidden Object auto-completes or allows Next when done.
                Let's keep a generic Next button for Hidden Object ONLY if they found all items?
                Or just show it always for testing/flexibility.
            */}
            {currentScreen.type === 'HIDDEN_OBJECT' && (
                <View style={styles.footer}>
                     <TouchableOpacity 
                        style={styles.nextButton} 
                        onPress={handleNextScreen}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>Next {">>"}</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10
    },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    scoreText: { color: 'white', fontWeight: 'bold' },
    content: { flex: 1 },
    gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', alignItems: 'center', justifyContent: 'center' },
    instruction: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textShadowColor: 'black', textShadowRadius: 4 },
    itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    itemButton: { backgroundColor: 'white', padding: 10, borderRadius: 8 },
    question: { color: 'white', fontSize: 18, textAlign: 'center', margin: 20 },
    optionButton: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginVertical: 5, width: '80%', alignItems: 'center' },
    footer: { height: 60, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20 },
    nextButton: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    nextButtonText: { color: 'white', fontWeight: 'bold' }
});

export default GamePlayScreen;
