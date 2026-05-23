import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";

import { useNews } from "../../context/NewsContext";
import { useComments } from "../../context/CommentContext";
import { useAuth } from "../../context/AuthContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestNews = () => {

  const { darkMode } = useDarkMode();

  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#ffffff",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
  };

  const {
    latestNews,
    loading,
    fetchLatestNews,
  } = useNews();

  const { createComment } = useComments();

  const { user } = useAuth();

  const [modalVisible, setModalVisible] =
    useState(false);

  const [activeNews, setActiveNews] =
    useState<any>(null);

  const [commentText, setCommentText] =
    useState("");

  const [likedNews, setLikedNews] =
    useState<Record<number, boolean>>(
      {}
    );

  /* ================================
     FETCH
  ================================= */

  useEffect(() => {
    fetchLatestNews();
  }, []);

  /* ================================
     LIKES STORAGE
  ================================= */

  useEffect(() => {
    (async () => {

      const savedLikes =
        await AsyncStorage.getItem(
          "latestNewsLikes"
        );

      if (savedLikes) {
        setLikedNews(
          JSON.parse(savedLikes)
        );
      }

    })();
  }, []);

  useEffect(() => {

    AsyncStorage.setItem(
      "latestNewsLikes",
      JSON.stringify(likedNews)
    );

  }, [likedNews]);

  /* ================================
     OPEN COMMENTS
  ================================= */

  const openComments = (news: any) => {

    setActiveNews(news);

    setModalVisible(true);

  };

  const closeComments = () => {

    setModalVisible(false);

    setCommentText("");

    setActiveNews(null);

  };

  /* ================================
     SHARE
  ================================= */

  const handleShare = async (
    item: any
  ) => {

    try {

      await Share.share({
        message: `${item.titulo}\n\n${item.descripcion}`,
      });

    } catch (error) {

      Alert.alert(
        "Error",
        "No se pudo compartir"
      );

    }

  };

  /* ================================
     LIKE
  ================================= */

  const handleLike = (id: number) => {

    setLikedNews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  };

  /* ================================
     ADD COMMENT
  ================================= */

  const handleAddComment = async () => {

    if (!commentText.trim()) return;

    try {

      const newComment = {
        id: Date.now(),
        content: commentText,
        user,
        created_at:
          new Date().toISOString(),
      };

      setActiveNews((prev: any) => ({
        ...prev,
        comments: [
          newComment,
          ...(prev?.comments || []),
        ],
      }));

      await createComment({
        news_id: activeNews.id,
        comment: commentText,
      });

      setCommentText("");

    } catch (error) {

      Alert.alert(
        "Error",
        "No se pudo comentar"
      );

    }

  };

  /* ================================
     COMMENT ITEM
  ================================= */

  const renderComment = useCallback(
    ({ item }: any) => (

      <View
        style={[
          styles.commentBubble,
          {
            backgroundColor:
              colors.comment,
          },
        ]}
      >

        <Text
          style={[
            styles.commentUser,
            { color: colors.text },
          ]}
        >
          {item.user?.name ||
            "Usuario"}
        </Text>

        <Text
          style={[
            styles.commentText,
            { color: colors.text },
          ]}
        >
          {item.content}
        </Text>

        <Text
          style={[
            styles.commentDate,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {new Date(
            item.created_at
          ).toLocaleString()}
        </Text>

      </View>

    ),
    [darkMode]
  );

  /* ================================
     LOADING
  ================================= */

  if (loading) {

    return (
      <ActivityIndicator
        size="large"
        color="#00B272"
        style={{ marginVertical: 20 }}
      />
    );

  }

  if (
    !latestNews ||
    latestNews.length === 0
  ) {

    return (
      <Text
        style={{
          textAlign: "center",
          marginVertical: 20,
          color: colors.text,
        }}
      >
        No hay noticias disponibles
      </Text>
    );

  }

  return (

    <View style={styles.latestNewsContainer}>

      <Text
        style={[
          styles.latestNewsTitle,
          { color: colors.text },
        ]}
      >
        Últimas Noticias
      </Text>

      <FlatList
        data={latestNews}
        keyExtractor={(item) =>
          item.id.toString()
        }
        scrollEnabled={false}
        renderItem={({ item }) => (

          <View
            style={[
              styles.newsItem,
              {
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >

            <Image
              source={{
                uri:
                  item.url ||
                  "https://picsum.photos/400",
              }}
              style={styles.newsImage}
            />

            <View style={styles.newsHeader}>

              <Image
                source={{
                  uri:
                    item.user?.url ||
                    "https://i.pravatar.cc/100",
                }}
                style={styles.newsAvatar}
              />

              <Text
                style={[
                  styles.newsName,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {item.user?.name ||
                  "Usuario"}
              </Text>

            </View>

            <Text
              style={[
                styles.newsTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {item.titulo}
            </Text>

            <Text
              style={[
                styles.newsDescription,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {item.descripcion}
            </Text>

            {/* ACTIONS */}

            <View
              style={[
                styles.newsActions,
                {
                  borderTopColor:
                    colors.border,
                },
              ]}
            >

              {/* SHARE */}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  handleShare(item)
                }
              >

                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={colors.green}
                />

                <Text
                  style={[
                    styles.actionText,
                    {
                      color:
                        colors.green,
                    },
                  ]}
                >
                  Compartir
                </Text>

              </TouchableOpacity>

              {/* COMMENT */}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  openComments(item)
                }
              >

                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colors.green}
                />

                <Text
                  style={[
                    styles.actionText,
                    {
                      color:
                        colors.green,
                    },
                  ]}
                >
                  Comentar
                </Text>

              </TouchableOpacity>

              {/* LIKE */}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  handleLike(item.id)
                }
              >

                <Ionicons
                  name={
                    likedNews[item.id]
                      ? "heart"
                      : "heart-outline"
                  }
                  size={20}
                  color={
                    likedNews[item.id]
                      ? "red"
                      : colors.green
                  }
                />

                <Text
                  style={[
                    styles.actionText,
                    {
                      color:
                        colors.green,
                    },
                  ]}
                >
                  Me gusta
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )}
      />

      {/* MODAL COMMENTS */}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
      >

        <View style={styles.modalBackdrop}>

          <KeyboardAvoidingView
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : "height"
            }
            style={[
              styles.modalContainer,
              {
                backgroundColor:
                  colors.modal,
              },
            ]}
          >

            {/* HEADER */}

            <View style={styles.modalHeader}>

              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                Comentarios
              </Text>

              <TouchableOpacity
                onPress={closeComments}
              >

                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text}
                />

              </TouchableOpacity>

            </View>

            {/* COMMENTS */}

            <FlatList
              data={
                activeNews?.comments ||
                []
              }
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={renderComment}
              showsVerticalScrollIndicator={
                false
              }
            />

            {/* INPUT */}

            <View style={styles.inputRow}>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colors.input,

                    borderColor:
                      colors.border,

                    color:
                      colors.text,
                  },
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={
                  darkMode
                    ? "#94A3B8"
                    : "#999"
                }
                value={commentText}
                onChangeText={
                  setCommentText
                }
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={
                  handleAddComment
                }
              >

                <Ionicons
                  name="send"
                  size={20}
                  color="#fff"
                />

              </TouchableOpacity>

            </View>

          </KeyboardAvoidingView>

        </View>

      </Modal>

    </View>

  );

};

export default LatestNews;

const styles = StyleSheet.create({

  latestNewsContainer: {
    width: "100%",
    marginTop: 20,
  },

  latestNewsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  newsItem: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 9,
    borderRadius: 14,
    borderWidth: 1,
  },

  newsImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },

  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  newsAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  newsName: {
    fontWeight: "700",
    fontSize: 16,
  },

  newsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  newsDescription: {
    fontSize: 14,
    marginBottom: 10,
  },

  newsActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 8,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    marginLeft: 4,
    fontWeight: "500",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    height: "60%",
    borderRadius: 20,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },

  sendButton: {
    backgroundColor: "#00B272",
    padding: 10,
    borderRadius: 20,
  },

  commentBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },

  commentUser: {
    fontWeight: "700",
    marginBottom: 2,
  },

  commentText: {
    fontSize: 14,
  },

  commentDate: {
    fontSize: 10,
    marginTop: 2,
  },

});