import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { AIService, ChatMessage } from "@/src/services/ai.service";

const AIChatScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await AIService.sendMessage(userMsg.content);
      const reply = response.data?.reply || "Xin lỗi, tôi không hiểu ý bạn.";
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Có lỗi xảy ra khi kết nối với AI.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    // Check if initial greeting is needed
    if (messages.length === 0) {
        setMessages([{
            id: 'init',
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý ảo SEN. Tôi có thể giúp gì cho bạn về di sản văn hóa Việt Nam?'
        }]);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.DARK} />
        </TouchableOpacity>
        <Text style={styles.title}>Trợ lý ảo SEN</Text>
        <View style={{width: 24}} /> 
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={COLORS.GRAY}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.disabledBtn]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
                <Ionicons name="send" size={20} color={COLORS.WHITE} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: COLORS.WHITE,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
  },
  backButton: {
      padding: 4,
  },
  title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.DARK,
  },
  listContent: {
      padding: 16,
      paddingBottom: 20,
  },
  messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
  },
  userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: COLORS.PRIMARY,
      borderBottomRightRadius: 4,
  },
  assistantBubble: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.WHITE,
      borderBottomLeftRadius: 4,
  },
  messageText: {
      fontSize: 15,
      lineHeight: 22,
  },
  userText: {
      color: COLORS.WHITE,
  },
  assistantText: {
      color: COLORS.DARK,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: COLORS.WHITE,
      borderTopWidth: 1,
      borderTopColor: '#EEE',
  },
  input: {
      flex: 1,
      backgroundColor: '#F0F0F0',
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      maxHeight: 100,
      color: COLORS.DARK,
  },
  sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
  },
  disabledBtn: {
      backgroundColor: COLORS.GRAY,
      opacity: 0.5,
  }
});

export default AIChatScreen;
