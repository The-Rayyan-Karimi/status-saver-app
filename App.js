import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import { FlatList, Text, View, TouchableOpacity, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const dummyImages = Array.from({ length: 12 });

function ImagesTab() {
  const [files, setFiles] = useState([]);
  console.log(FileSystem);
  const hasPermission = false; // we’ll change this later

  async function handleGrantAccess() {
    console.log("Button pressed");

    try {
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      console.log("After permission call");

      if (permission.granted) {
        console.log("GRANTED");

        console.log("Folder URI:", permission.directoryUri);

        const allFiles = FileSystem.StorageAccessFramework.readDirectoryAsync(permission.directoryUri);
        const images = (await allFiles).filter((file) => file.endsWith(".jpg")); // what if it ends with jpeg and all
        setFiles(images);
        console.log("Images:", images);
      } else {
        console.log("DENIED");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  if (files.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleGrantAccess}
          style={{
            backgroundColor: "#075E54",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "#fff" }}>Load Statuses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={files}
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

const dummyVideos = Array.from({ length: 9 });

function VideosTab() {
  return (
    <FlatList
      data={dummyVideos}
      numColumns={3}
      keyExtractor={(_, index) => index.toString()}
      renderItem={() => (
        <View
          style={{
            flex: 1,
            margin: 5,
            height: 120,
            backgroundColor: "#aaa",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>▶</Text>
        </View>
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