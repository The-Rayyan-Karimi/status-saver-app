import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const STATUS_FOLDER_URI_KEY = "@status_saver/statuses_folder_uri";

async function getStoredFolderUri() {
  return AsyncStorage.getItem(STATUS_FOLDER_URI_KEY);
}

async function saveFolderUri(uri) {
  await AsyncStorage.setItem(STATUS_FOLDER_URI_KEY, uri);
}

async function clearFolderUri() {
  await AsyncStorage.removeItem(STATUS_FOLDER_URI_KEY);
}

async function readStatusesFromFolder(uri) {
  return FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
}

/**
 * @param {{ promptIfNeeded?: boolean }} options
 * - promptIfNeeded false: use saved URI only; return null if none or access lost
 * - promptIfNeeded true: show SAF picker when needed
 * @returns {Promise<string[] | null>}
 */
async function getStatuses({ promptIfNeeded = false } = {}) {
  try {
    let folderUri = await getStoredFolderUri();

    if (folderUri) {
      try {
        return await readStatusesFromFolder(folderUri);
      } catch (readError) {
        console.log("Could not read saved folder, re-requesting access:", readError);
        const permission =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
            folderUri
          );
        if (permission.granted) {
          await saveFolderUri(permission.directoryUri);
          return await readStatusesFromFolder(permission.directoryUri);
        }
        await clearFolderUri();
      }
    }

    if (!promptIfNeeded) {
      return null;
    }

    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permission.granted) return [];

    await saveFolderUri(permission.directoryUri);
    return await readStatusesFromFolder(permission.directoryUri);
  } catch (error) {
    console.log(error);
    return promptIfNeeded ? [] : null;
  }
}

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

function ImagesTab({ allFiles, loading, needsAccess, onRequestAccess }) {
  const images = allFiles.filter(
    (file) =>
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".png")
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  if (needsAccess) {
    return (
      <AccessPrompt
        onPress={onRequestAccess}
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
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            flex: 1,
            margin: 5,
            height: 120,
          }}
        >
          <Image
            source={{ uri: item }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}
    />
  );
}

function VideosTab({ allFiles, loading, needsAccess, onRequestAccess }) {
  const videos = allFiles.filter((file) => file.endsWith(".mp4"));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  if (needsAccess) {
    return (
      <AccessPrompt
        onPress={onRequestAccess}
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
      keyExtractor={(item, index) => index.toString()}
      renderItem={() => (
        <View
          style={{
            flex: 1,
            margin: 5,
            height: 120,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>▶</Text>
        </View>
      )}
    />
  );
}

function StatusScreen() {
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsAccess, setNeedsAccess] = useState(false);

  async function loadStatuses(promptIfNeeded) {
    setLoading(true);
    const files = await getStatuses({ promptIfNeeded });

    if (files === null) {
      setNeedsAccess(true);
      setAllFiles([]);
    } else {
      setNeedsAccess(false);
      setAllFiles(files);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStatuses(false);
  }, []);

  function handleRequestAccess() {
    loadStatuses(true);
  }

  const tabProps = {
    allFiles,
    loading,
    needsAccess,
    onRequestAccess: handleRequestAccess,
  };

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#075E54" },
        tabBarLabelStyle: { color: "#fff", fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#fff" },
      }}
    >
      <TopTab.Screen name="IMAGES">
        {() => <ImagesTab {...tabProps} />}
      </TopTab.Screen>
      <TopTab.Screen name="VIDEOS">
        {() => <VideosTab {...tabProps} />}
      </TopTab.Screen>
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
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
