import { StatusBar } from 'expo-status-bar';
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const dummyImages = Array.from({ length: 12 });

function ImagesTab() {
  const hasPermission = false; // we’ll change this later

  if (!hasPermission) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ marginBottom: 10, fontSize: 16 }}>
          No statuses found
        </Text>

        <TouchableOpacity
          onPress={async () => {
            const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permission.granted) {
              console.log("Folder URI:", permission.directoryUri);
            } else {
              console.log("Permission denied");
            }
          }}
          style={{
            backgroundColor: "#075E54",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "#fff" }}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
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