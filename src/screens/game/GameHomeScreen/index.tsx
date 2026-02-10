import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { fetchChapters, fetchGameProgress } from "@/src/store/slices/gameSlice";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { Chapter } from "@/src/types/game.types";

const GameHomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();
  const { progress, chapters, loading } = useSelector((state: RootState) => state.game);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchGameProgress()),
      dispatch(fetchChapters())
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderChapter = (chapter: Chapter) => (
    <TouchableOpacity
      key={chapter.id}
      style={[styles.chapterCard, !chapter.isUnlocked && styles.lockedCard]}
      disabled={!chapter.isUnlocked}
      activeOpacity={0.9}
      onPress={() => {
          // Navigate to levels
          navigation.navigate('Levels', { chapterId: chapter.id, chapterTitle: chapter.title });
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
             <Text style={styles.chapterTitle}>{chapter.title}</Text>
             {!chapter.isUnlocked && <Ionicons name="lock-closed" size={20} color={COLORS.GRAY} />}
        </View>
        <Text style={styles.chapterDesc}>{chapter.description}</Text>
        
        {chapter.minLevelRequired && (
            <Text style={[styles.requirement, {color: COLORS.ERROR}]}>Yêu cầu cấp {chapter.minLevelRequired}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
     <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      {/* Header with Stats */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào!</Text>
          <Text style={styles.statsTitle}>Hành trình văn hóa</Text>
        </View>
        <View style={styles.pointsBadge}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.pointsText}>{progress?.totalPoints || 0}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Các chương thử thách</Text>
        <ScrollView 
            refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
            contentContainerStyle={styles.scrollContent}
        >
            {chapters.length > 0 ? (
                chapters.map(renderChapter)
            ) : (
                <View style={styles.emptyState}>
                    {!loading && <Text style={styles.emptyText}>Chưa có chương nào.</Text>}
                </View>
            )}
            
            {loading && !refreshing && (
                <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 20 }} />
            )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginBottom: 4,
  },
  statsTitle: {
      color: COLORS.WHITE,
      fontSize: 20,
      fontWeight: 'bold',
  },
  pointsBadge: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  pointsText: {
      color: COLORS.WHITE,
      fontWeight: 'bold',
      fontSize: 16,
  },
  content: {
      flex: 1,
      padding: 20,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.DARK,
      marginBottom: 16,
  },
  scrollContent: {
      paddingBottom: 20,
  },
  chapterCard: {
      backgroundColor: COLORS.WHITE,
      borderRadius: 16,
      marginBottom: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.PRIMARY,
  },
  lockedCard: {
      opacity: 0.7,
      borderLeftColor: COLORS.GRAY,
      backgroundColor: '#F0F0F0',
  },
  cardContent: {
      flex: 1,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  chapterTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.DARK,
      flex: 1,
  },
  chapterDesc: {
      fontSize: 13,
      color: COLORS.GRAY,
      lineHeight: 18,
  },
  requirement: {
      fontSize: 12,
      color: COLORS.ERROR,
      marginTop: 8,
      fontStyle: 'italic',
  },
  emptyState: {
      padding: 40,
      alignItems: 'center',
  },
  emptyText: {
      color: COLORS.GRAY,
  }
});

export default GameHomeScreen;
