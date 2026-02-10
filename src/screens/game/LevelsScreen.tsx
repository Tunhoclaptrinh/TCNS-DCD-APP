import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { fetchLevels, fetchLevelDetail } from "@/src/store/slices/gameSlice"; // Ensure these are exported
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { Level } from "@/src/types/game.types";
import { useRoute, useNavigation } from "@react-navigation/native";

const LevelsScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chapterId, chapterTitle } = route.params || {};

  const { levels, loading, error } = useSelector((state: RootState) => state.game);

  useEffect(() => {
    if (chapterId) {
      dispatch(fetchLevels(chapterId));
    }
  }, [dispatch, chapterId]);

  const handleLevelPress = (level: Level) => {
    if (!level.isUnlocked) {
      Alert.alert("Locked", "Complete previous levels to unlock this one.");
      return;
    }
    // Navigate to GamePlay
    navigation.navigate("GamePlay", { levelId: level.id, levelTitle: level.title });
  };

  const renderLevelItem = ({ item }: { item: Level }) => (
    <TouchableOpacity
      style={[styles.levelCard, !item.isUnlocked && styles.lockedCard]}
      onPress={() => handleLevelPress(item)}
      activeOpacity={0.8}
      disabled={!item.isUnlocked}
    >
      <View style={styles.levelIconContainer}>
        {item.isCompleted ? (
          <Ionicons name="checkmark-circle" size={32} color={COLORS.SUCCESS} />
        ) : !item.isUnlocked ? (
          <Ionicons name="lock-closed" size={32} color={COLORS.GRAY} />
        ) : (
          <Ionicons name="play-circle" size={32} color={COLORS.PRIMARY} />
        )}
      </View>
      <View style={styles.levelInfo}>
        <Text style={styles.levelTitle}>{item.title}</Text>
        <Text style={styles.levelDesc}>{item.description}</Text>
        <View style={styles.metaContainer}>
             <Text style={styles.difficulty}>{item.difficulty?.toUpperCase()}</Text>
             <Text style={styles.points}>{item.points} PTS</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.GRAY} />
    </TouchableOpacity>
  );

  if (loading && levels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chapterTitle || "Levels"}</Text>
          <View style={{width: 24}} /> 
      </View>

      <FlatList
        data={levels}
        renderItem={renderLevelItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No levels found for this chapter.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
      backgroundColor: COLORS.PRIMARY,
      padding: 16,
      paddingTop: 50, // Status bar
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
  },
  headerTitle: {
      fontSize: 18,
      color: COLORS.WHITE,
      fontWeight: 'bold',
  },
  backButton: {
      padding: 4,
  },
  listContent: {
    padding: 16,
  },
  levelCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: "#EEEEEE",
    opacity: 0.7,
  },
  levelIconContainer: {
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  metaContainer: {
      flexDirection: 'row',
      gap: 12
  },
  difficulty: {
      fontSize: 11,
      fontWeight: 'bold',
      color: COLORS.WARNING,
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4
  },
  points: {
      fontSize: 11,
      fontWeight: 'bold',
      color: COLORS.PRIMARY,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: 14,
  },
});

export default LevelsScreen;
