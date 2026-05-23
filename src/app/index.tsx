import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';

const VideoIntro = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    // Cargar el asset local
    const loadVideo = async () => {
      const asset = Asset.fromModule(require('../../assets/animacion-intro.mp4'));
      await asset.downloadAsync(); // asegura que está disponible
      setVideoUri(asset.localUri || asset.uri);
    };

    loadVideo();
  }, []);

  useEffect(() => {
    if (videoUri) {
      const timeout = setTimeout(() => {
        router.replace('/intro/v1');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [videoUri]);

  return (
    <View style={styles.container}>
      {videoUri && (
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="cover"
          shouldPlay
          isLooping
          useNativeControls={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  video: { width: '100%', height: '100%' },
});

export default VideoIntro;
