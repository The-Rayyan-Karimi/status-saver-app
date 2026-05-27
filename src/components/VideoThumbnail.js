import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";

export default function VideoThumbnail({ uri, style }) {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    async function generateThumbnail() {
      try {
        const { uri: thumbnailUri } =
          await VideoThumbnails.getThumbnailAsync(uri, {
            time: 1000,
          });

        setThumbnail(thumbnailUri);
      } catch (e) {
        console.log(e);
      }
    }

    generateThumbnail();
  }, [uri]);

  if (!thumbnail) {
    return (
      <View
        style={[
          style,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
          },
        ]}
      >
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <Image source={{ uri: thumbnail }} style={style} />;
}