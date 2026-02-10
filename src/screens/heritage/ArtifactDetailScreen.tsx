import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {getImageUrl} from "@/src/utils/formatters";

const {width, height} = Dimensions.get("window");

const ArtifactDetailScreen = ({route, navigation}: any) => {
  const {artifact} = route.params || {};

  React.useEffect(() => {
    if (!artifact) {
      navigation.goBack();
    }
  }, [artifact, navigation]);

  // If no artifact data, return null (allow useEffect to trigger goBack)
  if (!artifact) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Artifact Image Area */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: getImageUrl(artifact.image)}}
            style={styles.artifactImage}
            resizeMode="contain"
          />
           <TouchableOpacity style={styles.backButton} onPress={handleBack}>
             <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{artifact.name}</Text>
          

          <View style={styles.metaRow}>
             <View style={styles.tag}>
                 <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
                 <Text style={styles.tagText}>{artifact.yearCreated || artifact.era || "Đang cập nhật"}</Text>
             </View>
             <View style={styles.tag}>
                 <Ionicons name="location-outline" size={14} color={COLORS.PRIMARY} />
                 <Text style={styles.tagText}>{artifact.origin || "Vietnam"}</Text>
             </View>
          </View>
          
          {/* Interaction Row - Polished */}
          <View style={styles.interactionRow}>
             <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Thông báo", "Đã thêm vào bộ sưu tập!")}>
                <Ionicons name="heart-outline" size={20} color={COLORS.WHITE} />
                <Text style={styles.actionText}>Yêu thích</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={() => Alert.alert("Thông báo", "Đã sao chép liên kết!")}>
                <Ionicons name="share-social-outline" size={20} color={COLORS.PRIMARY} />
                <Text style={[styles.actionText, {color: COLORS.PRIMARY}]}>Chia sẻ</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Rich Details Grid */}
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Chi tiết hiện vật</Text>
             <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                   <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Chất liệu</Text>
                      <Text style={styles.infoValue}>{artifact.material || "Chưa rõ"}</Text>
                   </View>
                   <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Kích thước</Text>
                      <Text style={styles.infoValue}>{artifact.dimensions || "Chưa rõ"}</Text>
                   </View>
                </View>
                <View style={[styles.infoRow, {marginBottom: 0}]}>
                   <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tình trạng</Text>
                      <Text style={styles.infoValue}>{artifact.condition || "Tốt"}</Text>
                   </View>
                   <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Loại hình</Text>
                      <Text style={styles.infoValue}>{artifact.artifactType || artifact.category || "Cổ vật"}</Text>
                   </View>
                </View>
             </View>
          </View>

          {/* Contextual Sections */}
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Câu chuyện & Ý nghĩa</Text>
             <Text style={styles.description}>
               {artifact.description || "Chưa có mô tả chi tiết cho hiện vật này."}
             </Text>
             {artifact.historicalContext && (
                <View style={styles.contextBox}>
                   <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                       <Ionicons name="book-outline" size={16} color={COLORS.PRIMARY} />
                       <Text style={[styles.contextTitle, {marginBottom: 0, marginLeft: 6}]}>Ngữ cảnh lịch sử</Text>
                   </View>
                   <Text style={styles.contextText}>{artifact.historicalContext}</Text>
                </View>
             )}
             {artifact.culturalSignificance && (
                <View style={[styles.contextBox, {marginTop: 12, backgroundColor: '#F3E5F5', borderColor: '#9C27B0'}]}>
                   <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                       <Ionicons name="rose-outline" size={16} color="#9C27B0" />
                       <Text style={[styles.contextTitle, {marginBottom: 0, marginLeft: 6, color: '#9C27B0'}]}>Ý nghĩa văn hóa</Text>
                   </View>
                   <Text style={[styles.contextText, {color: '#4A148C'}]}>{artifact.culturalSignificance}</Text>
                </View>
             )}
          </View>

          {/* 3D Model Button */}
          <View style={styles.interactiveSection}>
             <TouchableOpacity 
                style={styles.interactiveButton}
                onPress={() => Alert.alert("Thông báo", "Chế độ xem 3D đang được xử lý và sẽ sớm ra mắt!")}
             >
                <Ionicons name="cube-outline" size={24} color={COLORS.WHITE} />
                <Text style={styles.interactiveButtonText}>Xem mô hình 3D</Text>
             </TouchableOpacity>
          </View>

           {/* Simple Related Feedback */}
           {artifact.relatedHeritageIds && (
              <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Di tích liên quan</Text>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 12, backgroundColor: '#F0F0F0', borderRadius: 8}}>
                    <Text style={{color: COLORS.PRIMARY, fontWeight: '600'}}>Xem di tích gốc</Text>
                 </TouchableOpacity>
              </View>
           )}
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
  imageContainer: {
    width: width,
    height: height * 0.5,
    backgroundColor: '#1a1a1a', // Dark background for artifacts
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  artifactImage: {
    width: '90%',
    height: '90%',
  },
  backButton: {
      position: 'absolute',
      top: 50, // Safe area approximation
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    minHeight: height * 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.DARK,
    marginBottom: 12,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.DARK,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.DARK_GRAY,
    marginBottom: 30,
  },
  interactiveSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  interactiveButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 8,
  },
  interactiveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  
  // New Styles
  interactionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
      flex: 1,
      height: 44,
      backgroundColor: COLORS.PRIMARY,
      borderRadius: 22,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
  },
  secondaryAction: {
      backgroundColor: '#FFF0F0',
  },
  actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.WHITE,
  },
  section: {
      marginBottom: 24,
  },
  infoGrid: {
     backgroundColor: '#F8F9FA',
     padding: 16,
     borderRadius: 12,
  },
  infoRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: 16,
  },
  infoItem: {
     flex: 1,
  },
  infoLabel: {
     fontSize: 12,
     color: COLORS.GRAY,
     marginBottom: 4,
  },
  infoValue: {
     fontSize: 14,
     fontWeight: '600',
     color: COLORS.DARK,
  },
  contextBox: {
     backgroundColor: '#FFF9F0', // Light warm background for history
     padding: 16,
     borderRadius: 8,
     borderLeftWidth: 3,
     borderLeftColor: COLORS.PRIMARY,
  },
  contextTitle: {
     fontSize: 14,
     fontWeight: '700',
     color: COLORS.DARK,
     marginBottom: 6,
  },
  contextText: {
     fontSize: 14,
     lineHeight: 22,
     color: COLORS.DARK_GRAY,
     fontStyle: 'italic',
  },
});

export default ArtifactDetailScreen;
