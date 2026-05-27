import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseStatusItems } from "../utils/statusItems";

const STATUS_FOLDER_URI_KEY = "@status_saver/statuses_folder_uri";

const StatusFolderContext = createContext(null);

async function getStoredFolderUri() {
  return AsyncStorage.getItem(STATUS_FOLDER_URI_KEY);
}

async function saveFolderUri(uri) {
  await AsyncStorage.setItem(STATUS_FOLDER_URI_KEY, uri);
}

async function clearStoredFolderUri() {
  await AsyncStorage.removeItem(STATUS_FOLDER_URI_KEY);
}

async function readStatusesFromFolder(uri) {
  const uris = await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
  return parseStatusItems(uris);
}

async function resolveStatusFiles({ promptIfNeeded = false, folderUri } = {}) {
  let uri = folderUri ?? (await getStoredFolderUri());

  if (uri) {
    try {
      return { files: await readStatusesFromFolder(uri), folderUri: uri };
    } catch (readError) {
      console.log("Could not read saved folder, re-requesting access:", readError);
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          uri
        );
      if (permission.granted) {
        uri = permission.directoryUri;
        await saveFolderUri(uri);
        return { files: await readStatusesFromFolder(uri), folderUri: uri };
      }
      await clearStoredFolderUri();
    }
  }

  if (!promptIfNeeded) {
    return { files: null, folderUri: null };
  }

  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) {
    return { files: [], folderUri: null };
  }

  uri = permission.directoryUri;
  await saveFolderUri(uri);
  return { files: await readStatusesFromFolder(uri), folderUri: uri };
}

export function StatusFolderProvider({ children }) {
  const [folderUri, setFolderUri] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsAccess, setNeedsAccess] = useState(false);

  const applyLoadResult = useCallback(({ files, folderUri: uri }) => {
    if (files === null) {
      setFolderUri(uri);
      setAllFiles([]);
      setNeedsAccess(true);
      return;
    }

    setFolderUri(uri);
    setAllFiles(files);
    files.forEach(element => {
      console.log(element.toString());
    });
    setNeedsAccess(false);
  }, []);

  const loadStatuses = useCallback(
    async (promptIfNeeded) => {
      setLoading(true);
      try {
        const result = await resolveStatusFiles({
          promptIfNeeded,
          folderUri: promptIfNeeded ? undefined : folderUri ?? undefined,
        });
        applyLoadResult(result);
      } catch (error) {
        console.log(error);
        if (promptIfNeeded) {
          applyLoadResult({ files: [], folderUri: null });
        } else {
          applyLoadResult({ files: null, folderUri: null });
        }
      } finally {
        setLoading(false);
      }
    },
    [applyLoadResult, folderUri]
  );

  const requestAccess = useCallback(() => loadStatuses(true), [loadStatuses]);

  const refreshStatuses = useCallback(async () => {
    if (!folderUri) return;
    setLoading(true);
    try {
      const files = await readStatusesFromFolder(folderUri);
      setAllFiles(files);
      files.forEach(element => {
        console.log(element.toString());
      });
      setNeedsAccess(false);
    } catch (error) {
      console.log("Refresh failed, reloading access:", error);
      await loadStatuses(false);
    } finally {
      setLoading(false);
    }
  }, [folderUri, loadStatuses]);

  const clearFolderAccess = useCallback(async () => {
    await clearStoredFolderUri();
    setFolderUri(null);
    setAllFiles([]);
    setNeedsAccess(true);
  }, []);

  useEffect(() => {
    async function init() {
      const storedUri = await getStoredFolderUri();
      setFolderUri(storedUri);
      setLoading(true);
      try {
        const result = await resolveStatusFiles({
          promptIfNeeded: false,
          folderUri: storedUri ?? undefined,
        });
        applyLoadResult(result);
      } catch (error) {
        console.log(error);
        applyLoadResult({ files: null, folderUri: storedUri });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [applyLoadResult]);

  const images = useMemo(
    () => allFiles.filter((item) => item.type === "image"),
    [allFiles]
  );

  const videos = useMemo(
    () => allFiles.filter((item) => item.type === "video"),
    [allFiles]
  );

  const value = useMemo(
    () => ({
      folderUri,
      allFiles,
      images,
      videos,
      loading,
      needsAccess,
      hasFolderAccess: Boolean(folderUri) && !needsAccess,
      requestAccess,
      refreshStatuses,
      clearFolderAccess,
    }),
    [
      folderUri,
      allFiles,
      images,
      videos,
      loading,
      needsAccess,
      requestAccess,
      refreshStatuses,
      clearFolderAccess,
    ]
  );

  return (
    <StatusFolderContext.Provider value={value}>
      {children}
    </StatusFolderContext.Provider>
  );
}

export function useStatusFolder() {
  const context = useContext(StatusFolderContext);
  if (!context) {
    throw new Error("useStatusFolder must be used within StatusFolderProvider");
  }
  return context;
}
