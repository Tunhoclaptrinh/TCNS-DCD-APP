import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {COLORS} from "@/src/styles/colors";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {FavoriteService} from "@/src/services/favorite.service";
import {Favorite} from "@/src/types";
import {Ionicons} from "@expo/vector-icons";
import {getImageUrl} from "@/src/utils/formatters";

const FavoritesListScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await FavoriteService.getAllFavorites();
      if (res && res.data) {
        setFavorites(res.data);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}: {item: Favorite}) => {
    const title = item.item?.name || item.item?.title || "Unknown Item";
    const image = item.item?.thumbnail || item.item?.image;
    const typeLabel = "Favorite";

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Image source={{uri: getImageUrl(image)}} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardContent}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{typeLabel}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.dateText}>Added on: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn}>
          <Ionicons name="heart" size={20} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <EmptyState icon="heart-outline" title="No favorites yet" subtitle="Your list of favorite items is empty." />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  typeTag: {
    backgroundColor: "#E3F2FD",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 10,
    color: "#1976D2",
    fontWeight: "600",
  },
  removeBtn: {
    padding: 12,
    justifyContent: "center",
  },
});

export default FavoritesListScreen;
