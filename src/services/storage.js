import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@focus_sessions';

export const saveSession = async (sessionData) => {
  try {
    const existingSessions = await getSessions();
    const newSessions = [...existingSessions, sessionData];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getSessions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(e) {
    console.error(e);
  }
};