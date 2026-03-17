import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// ==========================================
// 1. TİP TANIMLAMALARI
// ==========================================
interface User {
  id: string; ad: string; soyad: string; sifre: string;
  uzmanlik: string; hakkinda: string; github: string;
  xp: number; level: number; dogruSayisi: number; rozetler: string[];
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const AuthContext = createContext<{
  currentUser: User | null; allUsers: User[];
  register: (u: any) => void; login: (ad: string, sifre: string) => void;
  logout: () => void; updateXp: (xp: number, isCorrect: boolean) => void;
  updateProfile: (h: string, g: string) => void;
} | null>(null);

// ==========================================
// 2. 30 ADET SORU HAVUZU
// ==========================================
const RAW_QUESTIONS: Question[] = [
  { id: 1, question: "React Native'de metin yazdırmak için hangisi kullanılır?", options: ["View", "Text", "Image", "Button"], correctAnswer: 1 },
  { id: 2, question: "İnternet sitelerine güvenli bağlanmayı hangisi sağlar?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], correctAnswer: 2 },
  { id: 3, question: "Ağdaki cihazların IP adresini bulmasını sağlayan sistem?", options: ["DNS", "DHCP", "VPN", "UDP"], correctAnswer: 0 },
  { id: 4, question: "JavaScript'te bir değişkeni sabit yapmak için ne kullanılır?", options: ["let", "var", "const", "set"], correctAnswer: 2 },
  { id: 5, question: "Siber güvenlikte 'Phishing' neyi ifade eder?", options: ["Veri Kurtarma", "Oltalama Saldırısı", "Hız Testi", "Yedekleme"], correctAnswer: 1 },
  { id: 6, question: "React'te sayfa yüklendiğinde işlem yapmak için hangi Hook kullanılır?", options: ["useState", "useMemo", "useEffect", "useRef"], correctAnswer: 2 },
  { id: 7, question: "Hangisi bir mobil işletim sistemidir?", options: ["Windows", "MacOS", "Android", "Linux"], correctAnswer: 2 },
  { id: 8, question: "Aşağıdakilerden hangisi bir 'Frontend' kütüphanesidir?", options: ["Node.js", "Express", "React", "MongoDB"], correctAnswer: 2 },
  { id: 9, question: "Git'te dosyayı takibe almak için hangi komut yazılır?", options: ["git add", "git push", "git commit", "git pull"], correctAnswer: 0 },
  { id: 10, question: "Yazılımda 'Open Source' ne anlama gelir?", options: ["Ücretli Kod", "Kapalı Yazılım", "Açık Kaynak", "Sınırlı Erişim"], correctAnswer: 2 },
  { id: 11, question: "IP adresi genellikle kaç bölümden oluşur? (IPv4)", options: ["2", "4", "6", "8"], correctAnswer: 1 },
  { id: 12, question: "Hangisi bir programlama dili değildir?", options: ["Python", "Java", "HTML", "C++"], correctAnswer: 2 },
  { id: 13, question: "VS Code nedir?", options: ["Web Tarayıcı", "Kod Editörü", "İşletim Sistemi", "Oyun Motoru"], correctAnswer: 1 },
  { id: 14, question: "CSS'de yazı rengini değiştiren özellik?", options: ["background", "color", "font-weight", "border"], correctAnswer: 1 },
  { id: 15, question: "Google tarafından geliştirilen mobil dil?", options: ["Swift", "Kotlin", "PHP", "Ruby"], correctAnswer: 1 },
  { id: 16, question: "Büyük miktardaki verilerin saklandığı yapı?", options: ["RAM", "İşlemci", "Veritabanı", "Klavye"], correctAnswer: 2 },
  { id: 17, question: "Siber saldırı türü olan 'Brute Force' nedir?", options: ["Hızlandırma", "Şifre Deneme", "Veri Silme", "Renk Değiştirme"], correctAnswer: 1 },
  { id: 18, question: "React Native'de buton tıklama olayı hangisidir?", options: ["onClick", "onPress", "onTouch", "onPush"], correctAnswer: 1 },
  { id: 19, question: "Wi-Fi şifreleme standardı hangisidir?", options: ["PNG", "MP4", "WPA2/3", "DOCX"], correctAnswer: 2 },
  { id: 20, question: "HTML'de bir link hangi etiketle başlar?", options: ["<link>", "<img>", "<a>", "<div>"], correctAnswer: 2 },
  { id: 21, question: "JS'de dizinin uzunluğunu hangisi verir?", options: ["size", "count", "length", "index"], correctAnswer: 2 },
  { id: 22, question: "Hangisi popüler bir NoSQL veritabanıdır?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], correctAnswer: 2 },
  { id: 23, question: "Kodu buluta (GitHub) yükleme komutu?", options: ["git log", "git pull", "git push", "git init"], correctAnswer: 2 },
  { id: 24, question: "Dosya indirmek için kullanılan protokol?", options: ["SMTP", "FTP", "DNS", "HTTPS"], correctAnswer: 1 },
  { id: 25, question: "Yazılımda 'Bug' ne demektir?", options: ["Hız", "Hata", "Görsel", "Renk"], correctAnswer: 1 },
  { id: 26, question: "Dizilerde (Array) ilk elemanın sırası (Index)?", options: ["1", "0", "99", "A"], correctAnswer: 1 },
  { id: 27, question: "Apple'ın geliştirdiği programlama dili?", options: ["Java", "C#", "Swift", "Kotlin"], correctAnswer: 2 },
  { id: 28, question: "API nedir?", options: ["Uygulama Arayüzü", "Ekran Kartı", "Güç Kaynağı", "Kasa"], correctAnswer: 0 },
  { id: 29, question: "En güvenli şifre tipi hangisidir?", options: ["123456", "admin", "A*1b_9x!", "password"], correctAnswer: 2 },
  { id: 30, question: "JavaScript'te çıktı almak için ne kullanılır?", options: ["print()", "console.log()", "write()", "echo"], correctAnswer: 1 }
];

// Soruları karıştırma fonksiyonu
const shuffleQuestions = (array: Question[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// ==========================================
// 3. ANA UYGULAMA (BEYİN)
// ==========================================

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [screen, setScreen] = useState('Login');
  const [activeTab, setActiveTab] = useState('Explore');
  const [loading, setLoading] = useState(true);

  // EĞİTİM STATE'LERİ (Burada durmalı ki sekmeler arası silinmesin)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    const init = async () => {
      const data = await AsyncStorage.getItem('SiberEko_Data');
      if (data) setAllUsers(JSON.parse(data));
      // Soruları karıştır ve ayarla
      setQuizQuestions(shuffleQuestions(RAW_QUESTIONS));
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (allUsers.length > 0) AsyncStorage.setItem('SiberEko_Data', JSON.stringify(allUsers));
  }, [allUsers]);

  const updateXp = (val: number, isCorrect: boolean) => {
    if (!currentUser) return;
    const newCorrectCount = isCorrect ? currentUser.dogruSayisi + 1 : currentUser.dogruSayisi;
    const newXp = isCorrect ? currentUser.xp + val : currentUser.xp;
    const newLevel = Math.floor(newXp / 1500) + 1;
    
    let newBadges = [...currentUser.rozetler];
    if (newCorrectCount >= 1 && !newBadges.includes('🌱 İlk Adım')) newBadges.push('🌱 İlk Adım');
    if (newCorrectCount >= 3 && !newBadges.includes('⚡ Hızlı Öğrenen')) newBadges.push('⚡ Hızlı Öğrenen');
    if (newCorrectCount >= 8 && !newBadges.includes('🛡️ Siber Uzman')) newBadges.push('🛡️ Siber Uzman');
    if (newCorrectCount >= 12 && !newBadges.includes('🏆 Eko-Master')) newBadges.push('🏆 Eko-Master');

    const updated = { ...currentUser, xp: newXp, level: newLevel, dogruSayisi: newCorrectCount, rozetler: newBadges };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  const updateProfile = (h: string, g: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, hakkinda: h, github: g };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    Alert.alert("Başarılı", "Profil güncellendi.");
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      currentUser, allUsers, 
      register: (u) => { 
        const exists = allUsers.find(x => x.ad === u.ad);
        if(exists) return Alert.alert("Hata", "Bu kullanıcı adı alınmış.");
        setAllUsers([...allUsers, {...u, id: Math.random().toString(), xp: 0, level: 1, dogruSayisi: 0, rozetler: [], hakkinda: '', github: ''}]); 
        setScreen('Login'); 
      },
      login: (ad, sif) => { 
        const f = allUsers.find(u => u.ad === ad && u.sifre === sif); 
        if(f) { setCurrentUser(f); setQuizQuestions(shuffleQuestions(RAW_QUESTIONS)); } 
        else Alert.alert("Hata","Giriş başarısız."); 
      },
      logout: () => { setCurrentUser(null); setCurrentQuestionIdx(0); },
      updateXp, updateProfile
    }}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#0F111A'}}>
        {!currentUser ? (
          <AuthStack screen={screen} setScreen={setScreen} />
        ) : (
          <MainStack 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            quizProps={{quizQuestions, currentQuestionIdx, setCurrentQuestionIdx}}
          />
        )}
      </SafeAreaView>
    </AuthContext.Provider>
  );
}

// ==========================================
// 4. ALT BİLEŞENLER
// ==========================================

const MainStack = ({ activeTab, setActiveTab, quizProps }: any) => (
  <View style={{flex: 1}}>
    {activeTab === 'Explore' && <ExploreScreen />}
    {activeTab === 'Profile' && <ProfileScreen />}
    {activeTab === 'Quiz' && <QuizScreen {...quizProps} />}
    <View style={styles.tabBar}>
      {['Explore', 'Profile', 'Quiz'].map(t => (
        <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={styles.tab}>
          <Text style={[styles.tabT, activeTab === t && {color: '#6366F1'}]}>{t === 'Explore' ? 'Keşfet' : t === 'Profile' ? 'Profil' : 'Eğitim'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const QuizScreen = ({ quizQuestions, currentQuestionIdx, setCurrentQuestionIdx }: any) => {
  const { updateXp } = useContext(AuthContext)!;
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);

  const currentQ = quizQuestions[currentQuestionIdx];

  const check = (i: number) => {
    if (selIdx !== null) return;
    setSelIdx(i);
    updateXp(300, i === currentQ.correctAnswer);
  };

  const next = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) { 
      setCurrentQuestionIdx(currentQuestionIdx + 1); 
      setSelIdx(null); 
    } else {
      setIsDone(true);
    }
  };

  if (isDone) return (
    <View style={styles.screen}>
      <Text style={styles.qText}>Tüm Soruları Bitirdin! Harikasın.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => {setIsDone(false); setCurrentQuestionIdx(0); setSelIdx(null);}}>
        <Text style={styles.btnText}>Soruları Baştan Karıştır</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.cardSub}>Soru {currentQuestionIdx + 1} / {quizQuestions.length}</Text>
      <View style={styles.quizBox}>
        <Text style={styles.qText}>{currentQ?.question}</Text>
        {currentQ?.options.map((o: string, i: number) => {
          const isCorrect = i === currentQ.correctAnswer;
          const isSelected = i === selIdx;
          let btnStyle = {};
          if (selIdx !== null) {
            if (isCorrect) btnStyle = { backgroundColor: '#10B981' };
            else if (isSelected) btnStyle = { backgroundColor: '#EF4444' };
          }
          return (
            <TouchableOpacity key={i} style={[styles.optBtn, btnStyle]} onPress={() => check(i)}>
              <Text style={styles.optText}>{o}</Text>
            </TouchableOpacity>
          );
        })}
        {selIdx !== null && <TouchableOpacity style={styles.nextBtn} onPress={next}><Text style={styles.btnText}>Sonraki Soru</Text></TouchableOpacity>}
      </View>
    </View>
  );
};

// --- Explore, Profile ve Auth kısımları aynı kalıyor, stiller dahil ---
const ExploreScreen = () => {
  const { allUsers } = useContext(AuthContext)!;
  const [sel, setSel] = useState<User | null>(null);
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Topluluk</Text>
      <FlatList data={allUsers} keyExtractor={item => item.id} renderItem={({ item }) => (
        <TouchableOpacity style={styles.devCard} onPress={() => setSel(item)}>
          <View><Text style={styles.cardName}>{item.ad} {item.soyad}</Text><Text style={styles.cardSub}>{item.uzmanlik} • Seviye {item.level}</Text></View>
          <Text style={styles.cardXp}>⚡ {item.xp} XP</Text>
        </TouchableOpacity>
      )} />
      <Modal visible={!!sel} transparent animationType="slide"><View style={styles.modalBg}><View style={styles.modalContent}>
        <Text style={styles.modalName}>{sel?.ad} {sel?.soyad}</Text>
        <Text style={styles.modalLabel}>Hakkında:</Text><Text style={styles.modalText}>{sel?.hakkinda || "Bilgi yok."}</Text>
        <Text style={styles.modalLabel}>Başarımlar:</Text>
        <View style={styles.badgeRow}>{sel?.rozetler.map((r,i) => <View key={i} style={styles.badge}><Text style={styles.badgeText}>{r}</Text></View>)}</View>
        <TouchableOpacity style={styles.gitBtn} onPress={() => sel?.github && Linking.openURL(sel.github.startsWith('http') ? sel.github : `https://${sel.github}`)}><Text style={styles.btnText}>GitHub</Text></TouchableOpacity>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSel(null)}><Text style={styles.modalCloseText}>Kapat</Text></TouchableOpacity>
      </View></View></Modal>
    </View>
  );
};

const ProfileScreen = () => {
  const { currentUser, logout, updateProfile } = useContext(AuthContext)!;
  const [h, setH] = useState(currentUser?.hakkinda || '');
  const [g, setG] = useState(currentUser?.github || '');
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.profileBox}>
        <Text style={styles.pName}>{currentUser?.ad}</Text>
        <Text style={styles.pSub}>Lvl {currentUser?.level} • {currentUser?.xp} XP</Text>
        <TextInput style={styles.input} placeholder="Hakkında..." value={h} onChangeText={setH} placeholderTextColor="#555" />
        <TextInput style={styles.input} placeholder="GitHub Linki" value={g} onChangeText={setG} placeholderTextColor="#555" />
        <TouchableOpacity style={styles.saveBtn} onPress={() => updateProfile(h, g)}><Text style={styles.btnText}>Güncelle</Text></TouchableOpacity>
        <Text style={styles.modalLabel}>Başarımlarım:</Text>
        <View style={[styles.badgeRow, {marginTop: 10}]}>
          {currentUser?.rozetler.map((r,i) => <View key={i} style={styles.badge}><Text style={styles.badgeText}>{r}</Text></View>)}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>Çıkış Yap</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const AuthStack = ({ screen, setScreen }: any) => {
  const { login, register } = useContext(AuthContext)!;
  const [f, setF] = useState({ ad: '', soyad: '', uzmanlik: '', sifre: '' });
  return (
    <View style={styles.authBg}>
      <Text style={styles.logo}>SiberEko</Text>
      <Text style={styles.authTag}>{screen === 'Login' ? 'Mühendis Girişi' : 'Kaydol'}</Text>
      <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="#555" onChangeText={t => setF({...f, ad: t})} />
      {screen === 'Register' && <TextInput style={styles.input} placeholder="Soyad" placeholderTextColor="#555" onChangeText={t => setF({...f, soyad: t})} />}
      {screen === 'Register' && <TextInput style={styles.input} placeholder="Uzmanlık" placeholderTextColor="#555" onChangeText={t => setF({...f, uzmanlik: t})} />}
      <TextInput style={styles.input} placeholder="Şifre" secureTextEntry placeholderTextColor="#555" onChangeText={t => setF({...f, sifre: t})} />
      <TouchableOpacity style={styles.primaryBtn} onPress={() => screen === 'Login' ? login(f.ad, f.sifre) : register(f as any)}>
        <Text style={styles.btnText}>{screen === 'Login' ? 'GİRİŞ YAP' : 'KAYDI TAMAMLA'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setScreen(screen === 'Login' ? 'Register' : 'Login')}>
        <Text style={styles.toggleText}>{screen === 'Login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten üye misin? Giriş Yap'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  authBg: { flex: 1, backgroundColor: '#0F111A', justifyContent: 'center', padding: 40 },
  logo: { fontSize: 42, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 5 },
  authTag: { color: '#6366F1', textAlign: 'center', marginBottom: 40, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderBottomColor: '#222', color: '#FFF', padding: 12, marginBottom: 15 },
  primaryBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtn: { backgroundColor: '#6366F1', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
  nextBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  toggleText: { color: '#555', textAlign: 'center', marginTop: 20 },
  screen: { flex: 1, backgroundColor: '#0F111A', padding: 25 },
  screenTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  devCard: { backgroundColor: '#1A1D2E', padding: 18, borderRadius: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardSub: { color: '#6366F1', fontSize: 12 },
  cardXp: { color: '#FFF', fontWeight: 'bold' },
  profileBox: { alignItems: 'center', marginTop: 10 },
  pName: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  pSub: { color: '#6366F1', marginBottom: 20 },
  quizBox: { backgroundColor: '#1A1D2E', padding: 25, borderRadius: 25, marginTop: 40 },
  qText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 25 },
  optBtn: { backgroundColor: '#252945', padding: 14, borderRadius: 12, marginBottom: 10 },
  optText: { color: '#FFF', textAlign: 'center' },
  tabBar: { flexDirection: 'row', height: 75, backgroundColor: '#0F111A', borderTopWidth: 1, borderColor: '#222', paddingBottom: 15 },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabT: { color: '#555', fontWeight: 'bold', fontSize: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#252945', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#6366F1' },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1A1D2E', borderRadius: 25, padding: 25 },
  modalName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  modalLabel: { color: '#6366F1', fontWeight: 'bold', marginTop: 15, fontSize: 13 },
  modalText: { color: '#AAA', fontSize: 13, marginTop: 4 },
  modalCloseBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
  modalCloseText: { color: '#FFF' },
  gitBtn: { backgroundColor: '#333', padding: 12, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  logoutBtn: { marginTop: 30 },
  logoutText: { color: '#FF3B30', fontWeight: 'bold' }
});