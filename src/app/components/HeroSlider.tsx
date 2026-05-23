import React, { useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const { width } = Dimensions.get("window");

type ImageSource = { uri: string } | number;

interface HeroSliderProps {
  images?: ImageSource[];
}

const defaultImages: string[] = [
  "https://picsum.photos/id/1015/400/400",
  "https://picsum.photos/id/1016/400/400",
  "https://picsum.photos/id/1018/400/400",
];

const HeroSlider: React.FC<HeroSliderProps> = ({ images = defaultImages }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return (
    <View style={{ position: "relative", height: 250 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{ width: "100%" }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={image}
            style={{ width, height: 250, resizeMode: "cover" }}
          />
        ))}
      </ScrollView>

      {/* Dots */}
      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              marginHorizontal: 4,
              borderRadius: 999,
              backgroundColor:
                currentIndex === index ? "#A7F3D0" : "#D1FAE5", // verdes pastel
            }}
          />
        ))}
      </View>

      {/* Left arrow */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: "50%",
          left: 10,
          padding: 10,
          backgroundColor: "rgba(72, 187, 120, 0.6)", // verde translúcido
          borderRadius: 50,
          opacity: currentIndex > 0 ? 1 : 0.5,
        }}
        onPress={() => goToSlide(currentIndex - 1)}
        disabled={currentIndex === 0}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 18 }}>{"<"}</Text>
      </TouchableOpacity>

      {/* Right arrow */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: "50%",
          right: 10,
          padding: 10,
          backgroundColor: "rgba(72, 187, 120, 0.6)", // mismo tono
          borderRadius: 50,
          opacity: currentIndex < images.length - 1 ? 1 : 0.5,
        }}
        onPress={() => goToSlide(currentIndex + 1)}
        disabled={currentIndex === images.length - 1}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 18 }}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeroSlider;
