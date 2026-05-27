import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  StatusFolderProvider,
  useStatusFolder,
} from "./src/context/StatusFolderContext";
import ImageViewerScreen from "./src/screens/ImageViewerScreen";
import VideoPlayerScreen from "./src/screens/VideoPlayerScreen";
import VideoThumbnail from "./src/components/VideoThumbnail";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const RootStack = createNativeStackNavigator();

function AccessPrompt({ onPress, label }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: "#075E54",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "#fff" }}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabLoading() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#075E54" />
    </View>
  );
}

function ImagesTab() {
  const { images, loading, needsAccess, requestAccess } = useStatusFolder();
  const navigation = useNavigation();

  if (loading) return <TabLoading />;

  if (needsAccess) {
    return (
      <AccessPrompt
        onPress={requestAccess}
        label="Select .Statuses folder"
      />
    );
  }

  if (images.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No image statuses found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            flex: 1,
            margin: 5,
            height: 120,
          }}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("ImageViewer", { uri: item.uri })
          }
        >
          <Image
            source={{ uri: item.uri }}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>
      )}
    />
  );
}

function VideosTab() {
  const { videos, loading, needsAccess, requestAccess } = useStatusFolder();
  const navigation = useNavigation();

  if (loading) return <TabLoading />;

  if (needsAccess) {
    return (
      <AccessPrompt
        onPress={requestAccess}
        label="Select .Statuses folder"
      />
    );
  }

  if (videos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No video statuses found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            flex: 1,
            margin: 5,
            height: 120,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("VideoPlayer", { uri: item.uri })
          }
        >
          {/* <Text style={{ color: "#fff", fontSize: 28 }}>▶</Text> */}
          <>
            <VideoThumbnail
              uri={item.uri}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
            />

            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                zIndex: 2,
              }}
            >
              ▶
            </Text>
          </>
        </TouchableOpacity>
      )}
    />
  );
}

function StatusScreen() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#075E54" },
        tabBarLabelStyle: { color: "#fff", fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#fff" },
      }}
    >
      <TopTab.Screen name="IMAGES" component={ImagesTab} />
      <TopTab.Screen name="VIDEOS" component={VideosTab} />
    </TopTab.Navigator>
  );
}

function SavedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Saved Screen</Text>
    </View>
  );
}

function SettingsScreen() {
  const { hasFolderAccess, clearFolderAccess } = useStatusFolder();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ marginBottom: 8 }}>
        {hasFolderAccess ? "Statuses folder connected" : "No statuses folder selected"}
      </Text>
      {hasFolderAccess && (
        <TouchableOpacity
          onPress={clearFolderAccess}
          style={{
            backgroundColor: "#075E54",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "#fff" }}>Change .Statuses folder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#075E54" },
        headerTitle: "Status Saver",
        headerTitleStyle: { color: "#fff" },
        headerTintColor: "#fff",

        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Text style={{ color: "#fff" }}>WA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Text style={{ color: "#fff" }}>Share</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="ImageViewer" component={ImageViewerScreen} />
        <RootStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StatusFolderProvider>
      <AppNavigator />
    </StatusFolderProvider>
  );
}
