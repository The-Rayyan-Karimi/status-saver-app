import { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";

export default function VideoPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playingChange", ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  function togglePlayPause() {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }

  function handleReplay() {
    player.replay();
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReplay} style={styles.controlButton}>
          <Text style={styles.controlText}>↻ Replay</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
          <Text style={styles.controlText}>{isPlaying ? "⏸ Pause" : "▶ Play"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  controls: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  controlText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
