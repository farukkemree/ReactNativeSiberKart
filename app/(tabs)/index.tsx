import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type YazilimciKartiProps = {
  ad: string;
  uzmanlik: string;
  seviye: string;
};

const YazilimciKarti = ({ ad, uzmanlik, seviye }: YazilimciKartiProps) => {
  const [musaitMi, setMusaitMi] = useState(true);

  return (
    <View style={[styles.card, { borderColor: musaitMi ? '#00FF41' : '#FF3131' }]}>
      <View style={styles.header}>
        <Text style={styles.avatar}>{musaitMi ? '👨‍💻' : '⌛'}</Text>
        <View>
          <Text style={styles.nameText}>{ad}</Text>
          <Text style={styles.subText}>{uzmanlik}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{seviye}</Text>
        </View>
        <Text style={[styles.statusText, { color: musaitMi ? '#00FF41' : '#FF3131' }]}>
          {musaitMi ? "● MÜSAİT" : "● ÇALIŞIYOR"}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: musaitMi ? '#00FF41' : '#222' }]}
        onPress={() => setMusaitMi(false)}
        disabled={!musaitMi}
      >
        <Text style={[styles.buttonText, { color: musaitMi ? '#000' : '#888' }]}>
          {musaitMi ? "İşe Al" : "Projelerde Çalışıyor"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <YazilimciKarti 
        ad="Faruk" 
        uzmanlik="Software Engineer & Cyber Security" 
        seviye="Senior Candidate" 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  card: { width: '90%', backgroundColor: '#151515', borderRadius: 20, padding: 25, borderWidth: 1.5, elevation: 20, shadowColor: '#00FF41', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 10 } },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { fontSize: 45, marginRight: 15 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  subText: { color: '#00FF41', fontSize: 14, fontWeight: '500' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  badge: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  statusText: { fontWeight: 'bold', fontSize: 13 },
  button: { padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontWeight: '900', fontSize: 16 },
});