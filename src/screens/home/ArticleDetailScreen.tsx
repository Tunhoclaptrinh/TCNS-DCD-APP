import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import RenderHtml from "react-native-render-html";
import { getImageUrl } from "@/src/utils/formatters";

const { width } = Dimensions.get("window");

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { article } = route.params || {};

  if (!article) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy bài viết</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header back button overlay */}
      <TouchableOpacity 
         style={styles.backButton} 
         onPress={() => navigation.goBack()}
      >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.coverContainer}>
             <Image 
                source={{ uri: article.image ? getImageUrl(article.image) : "https://via.placeholder.com/600x400" }} 
                style={styles.coverImage} 
                resizeMode="cover" 
             />
             <View style={styles.overlay} />
             <View style={styles.headerContent}>
                 <View style={styles.badge}>
                     <Text style={styles.badgeText}>{article.category || "Bài viết"}</Text>
                 </View>
                 <Text style={styles.title}>{article.title}</Text>
                 <Text style={styles.meta}>{article.year ? `Năm: ${article.year}` : ""} • {article.author || "SEN Editorial"}</Text>
             </View>
        </View>

        <View style={styles.content}>
           {/* Description / Lead */}
           {article.description && (
               <Text style={styles.lead}>{article.description}</Text>
           )}

           <View style={styles.divider} />

           {/* HTML Content */}
           <RenderHtml
                contentWidth={width - 40}
                source={{ html: article.content || "<p>Nội dung đang cập nhật...</p>" }}
                tagsStyles={{
                    p: { fontSize: 16, lineHeight: 26, color: COLORS.DARK_GRAY, marginBottom: 16 },
                    h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.PRIMARY, marginTop: 16, marginBottom: 8 },
                    h3: { fontSize: 18, fontWeight: 'bold', color: COLORS.DARK, marginTop: 12, marginBottom: 8 },
                    img: { borderRadius: 8, marginVertical: 8 },
                    strong: { fontWeight: 'bold', color: COLORS.DARK }
                }}
            />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center'
  },
  coverContainer: {
      height: 300,
      position: 'relative'
  },
  coverImage: {
      width: '100%',
      height: '100%'
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      // Gradient from bottom
  },
  headerContent: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
  },
  badge: {
      backgroundColor: COLORS.PRIMARY,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 8
  },
  badgeText: {
      color: COLORS.WHITE,
      fontSize: 12,
      fontWeight: 'bold'
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.WHITE,
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  meta: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
  },
  content: {
      padding: 20,
      backgroundColor: COLORS.WHITE,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24
  },
  lead: {
      fontSize: 16,
      fontStyle: 'italic',
      color: COLORS.DARK_GRAY,
      marginBottom: 16,
      lineHeight: 24
  },
  divider: {
      height: 1,
      backgroundColor: COLORS.LIGHT_GRAY,
      marginBottom: 16
  }
});

export default ArticleDetailScreen;
