import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SessionResultModal({ visible, data, onSave, onDiscard }) {
  if (!visible || !data) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} dk ${s} sn`;
  };

  return (
    <View style={styles.absoluteOverlay}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Ionicons name="trophy" size={50} color="#f1c40f" />
          <Text style={styles.title}>Seans Tamamlandı!</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Kategori:</Text>
            <Text style={styles.statValue}>{data.category}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Süre:</Text>
            <Text style={styles.statValue}>{formatTime(data.duration)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bölünme:</Text>
            <Text style={[styles.statValue, { color: data.distractions > 0 ? 'tomato' : '#2ecc71' }]}>
              {data.distractions} Kez
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.discardButton} onPress={onDiscard}>
            <Text style={styles.discardText}>Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveText}>Kaydet</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  statsContainer: { width: '100%', marginBottom: 25 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  statLabel: { fontSize: 16, color: '#666' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  buttonContainer: { flexDirection: 'row', width: '100%', gap: 15 },
  saveButton: { flex: 1, backgroundColor: 'tomato', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  discardButton: { flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  discardText: { color: '#7f8c8d', fontSize: 16, fontWeight: '600' },
});