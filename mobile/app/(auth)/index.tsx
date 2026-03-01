import useSocialAuth from "@/hooks/useSocialAuth";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },

  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#5C4033", // cà phê đậm
    letterSpacing: 1,
  },

  tagline: {
    fontSize: 14,
    color: "#A1866F", // nâu sữa
    marginTop: 4,
    marginBottom: 32,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#6F4E37", // nâu cà phê
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#A1866F", // nâu sữa
    lineHeight: 22,
  },
});

const AuthScreen = () => {
  const { loading, handleGoogleAuth } = useSocialAuth();

  return (
    <View
      style={styles.container}
      className="px-8 flex-1 justify-center items-center bg-silver"
    >
      {/* Logo text */}
      <Text style={styles.logo}>Grocery</Text>

      {/* Slogan */}
      <Text style={styles.tagline}>
        Nền tảng mua sắm tiện lợi cho mọi người!
      </Text>

      <View>
        <TouchableOpacity
          className="w-full flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3"
          onPress={handleGoogleAuth}
          disabled={loading}
          style={{
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            elevation: 2,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <View className="relative w-full items-center justify-center">
              {/* ICON */}
              <Image
                source={require("../../assets/images/google.png")}
                className="absolute left-6 size-6"
                resizeMode="contain"
              />

              {/* TEXT */}
              <Text className="text-black font-medium text-base">
                Bắt đầu với Google
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
        Bằng việc đăng ký, bạn đồng ý với{" "}
        <Text className="text-blue-500">Điều khoản</Text>
        {", "}
        <Text className="text-blue-500">Chính sách bảo mật</Text>
        {", và "}
        <Text className="text-blue-500">Chính sách Cookie</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;