import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import CircularTimer from '../components/CircularTimer';
import ReanimatedText from '../components/ReanimatedText';
import SessionResultModal from '../components/SessionResultModal';
import { saveSession } from '../services/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const rotation = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isActive, setIsActive] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [category, setCategory] = useState("Kodlama");
  const [modalVisible, setModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [initialDuration, setInitialDuration] = useState(0);

  const [successSound, setSuccessSound] = useState();
  const confettiRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const categories = [
    { id: '1', name: "Kodlama", icon: "code-slash" },
    { id: '2', name: "Ders Çalışma", icon: "book" },
    { id: '3', name: "Kitap Okuma", icon: "library" },
    { id: '4', name: "Spor", icon: "bicycle" },
  ];

  useEffect(() => {
    async function loadSuccessSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(require('../../assets/success.wav'));
        setSuccessSound(sound);
      } catch (e) {}
    }
    loadSuccessSound();
    return () => { if (successSound) successSound.unloadAsync(); };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {
        display: isActive ? 'none' : 'flex',
        borderTopWidth: 2,
        borderTopColor: 'tomato',
        height: 60,
        paddingBottom: 10,
      }
    });
    headerTranslateY.value = withTiming(isActive ? -150 : 0, { duration: 300 });
  }, [isActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|active/) && nextAppState === 'background' && isActive) {
        setIsActive(false);
        setDistractionCount(prev => prev + 1);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  const finishSession = useCallback((completed = false) => {
    setIsActive(false);
    const durationSpent = completed ? initialDuration : (initialDuration - timeLeft);

    if (durationSpent < 2 && !completed) { 
      setIsActive(false); 
      return;
    }

    setSessionData({
      category: category,
      duration: durationSpent,
      distractions: distractionCount,
      date: new Date().toISOString(),
    });

    if (completed) {
      if (confettiRef.current) confettiRef.current.start();
      if (successSound) successSound.replayAsync().catch(() => {});
    }
    setResultModalVisible(true);
  }, [category, distractionCount, initialDuration, timeLeft, successSound]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
              finishSession(true);
              return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, finishSession]);

  const handleFinalChange = useCallback((seconds) => {
    if (isActive) return;
    setTimeLeft(seconds);
    setInitialDuration(seconds);
  }, [isActive]);

  const handleStartStop = () => {
    if (timeLeft <= 0) {
      Alert.alert("Süre Yok", "Lütfen çarkı çevirin.");
      return;
    }
    cancelAnimation(rotation);
    setIsActive(!isActive);
    if (!isActive && timeLeft === initialDuration) {
        setDistractionCount(0);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(0);
    setDistractionCount(0);
    cancelAnimation(rotation);
    rotation.value = withTiming(0, { duration: 300 });
  };

  const handleSaveSession = async () => {
    if (sessionData) {
      await saveSession(sessionData);
      Alert.alert("Başarılı", "Seans kaydedildi!");
    }
    setResultModalVisible(false);
    handleReset();
  };

  const handleDiscardSession = () => { setResultModalVisible(false); handleReset(); };
  
  const animatedHeaderStyle = useAnimatedStyle(() => ({ 
    transform: [{ translateY: headerTranslateY.value }], 
    opacity: isActive ? 0 : 1 
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={{position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, pointerEvents: 'none'}}>
           <ConfettiCannon count={200} origin={{x: -10, y: 0}} autoStart={false} ref={confettiRef} fadeOut={true} fallSpeed={3000} />
        </View>

        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Odaklanma Seansı</Text>
            <TouchableOpacity style={styles.categoryButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.categoryText}>{category} ▾</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerLine} />
        </Animated.View>

        <View style={styles.timerWrapper}>
          <CircularTimer 
            rotation={rotation}
            isActive={isActive} 
            duration={timeLeft} 
            onFinalChange={handleFinalChange}
          />
          <View style={styles.digitalClock}>
             <ReanimatedText rotation={rotation} maxMinutes={25} />
             <Text style={styles.statusText}>{isActive ? "ODAKLAN!" : (distractionCount > 0 ? `${distractionCount} KEZ BÖLÜNDÜ` : "SÜRE AYARLA")}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.playButton, { backgroundColor: isActive ? '#fbc531' : 'tomato' }]} onPress={handleStartStop}>
            <Ionicons name={isActive ? "pause" : "play"} size={32} color="#FFF" />
            <Text style={styles.playButtonText}>{isActive ? "DURAKLAT" : "BAŞLAT"}</Text>
          </TouchableOpacity>
        </View>

        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Kategori Seç</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => { setCategory(item.name); setModalVisible(false); }}>
                    <Ionicons name={item.icon} size={24} color="#555" />
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <SessionResultModal visible={resultModalVisible} data={sessionData} onSave={handleSaveSession} onDiscard={handleDiscardSession} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerContainer: { position: 'absolute', top: 50, width: width, zIndex: 5, paddingHorizontal: 0 },
  headerContent: { alignItems: 'center', paddingHorizontal: 20 },
  headerLine: { height: 2, backgroundColor: 'tomato', width: '100%', marginTop: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  categoryButton: { backgroundColor: 'tomato', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  categoryText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  timerWrapper: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  digitalClock: { position: 'absolute', justifyContent: 'center', alignItems: 'center', width: 150, height: 90, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 15, zIndex: 10 },
  statusText: { fontSize: 12, color: '#e74c3c', marginTop: -2, fontWeight: 'bold', textTransform: 'uppercase' },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, position: 'absolute', bottom: 50 },
  button: { justifyContent: 'center', alignItems: 'center', borderRadius: 50, elevation: 5 },
  resetButton: { width: 60, height: 60, backgroundColor: '#95a5a6' },
  playButton: { width: 160, height: 70, flexDirection: 'row', gap: 10 },
  playButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { flex: 1, fontSize: 18, marginLeft: 15 },
  closeButton: { marginTop: 20, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { fontSize: 16, fontWeight: 'bold' },
});