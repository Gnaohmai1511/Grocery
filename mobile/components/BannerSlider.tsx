import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function BannerSlider({ banners = [] }) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  // 👉 AUTO SLIDE
  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      let nextIndex = index + 1;

      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }

      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setIndex(nextIndex);
    }, 3000); // ⏱ 3s

    return () => clearInterval(interval);
  }, [index, banners.length]);

  // 👉 HANDLE SWIPE
  const handleScroll = (e: any) => {
    const slide = Math.round(
      e.nativeEvent.contentOffset.x / width
    );
    setIndex(slide);
  };

  if (!banners.length) return null;

  return (
    <View className="mb-6">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {banners.map((banner: any) => (
          <Image
            key={banner._id}
            source={{ uri: banner.image }}
            style={{
              width: width - 40,
              height: 160,
              marginHorizontal: 20,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* DOT INDICATOR */}
      <View className="flex-row justify-center mt-2">
        {banners.map((_: any, i: number) => (
          <View
            key={i}
            className={`mx-1 h-2 w-2 rounded-full ${
              i === index ? "bg-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );
}