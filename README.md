# Odaklanma ve Takip Uygulaması (Focus Tracker)

Bu proje, React Native (Expo) kullanılarak geliştirilmiş, Pomodoro tekniğini temel alan ve kullanıcının odaklanma sürelerini takip eden bir mobil uygulamadır.

## Özellikler

- **Fizik Tabanlı Zamanlayıcı:** `react-native-reanimated` ve `gesture-handler` ile geliştirilmiş, çevrilebilir dairesel sayaç (Circular Timer).
- **Arka Plan Takibi:** Uygulama alta atıldığında `AppState` ile durum takibi yapılır ve dikkat dağınıklığı olarak kaydedilir.
- **Veri Kalıcılığı:** Tamamlanan seanslar `AsyncStorage` kullanılarak cihaz hafızasında saklanır.
- **Detaylı Raporlama:** Son 7 günün odaklanma süreleri ve kategori dağılımları grafiklerle (Bar & Pie Chart) sunulur.
- **Oyunlaştırma:** Başarılı seans sonlarında konfeti ve ses efektleri.
- **Android Uyumu:** Immersive Mode ile tam ekran deneyimi.

## Kullanılan Teknolojiler

- **Core:** React Native, Expo Go
- **Navigasyon:** React Navigation (Bottom Tabs)
- **Animasyon & Jest:** React Native Reanimated, Gesture Handler
- **Grafikler:** React Native Chart Kit, React Native SVG
- **Depolama:** Async Storage
- **Ses:** Expo AV

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Repoyu klonlayın:**

    ```bash
    git clone [https://github.com/agoodjoe637/odaktakip.git](https://github.com/agoodjoe637/odaktakip.git)
    cd odaktakip
    ```

2.  **Bağımlılıkları yükleyin:**

    ```bash
    npm install
    ```

3.  **Uygulamayı başlatın:**
    ```bash
    npx expo start
    ```
    - Çıkan QR kodunu telefonunuzdaki **Expo Go** uygulaması ile okutun veya `a` tuşuna basarak Android Emulator'de çalıştırın.

**Geliştirici:** [Samet Güzel]
**Ders:** BSM 447 - Mobil Uygulama Geliştirme
