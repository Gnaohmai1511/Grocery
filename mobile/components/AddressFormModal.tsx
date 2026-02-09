import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import SafeScreen from "./SafeScreen";
import { Ionicons } from "@expo/vector-icons";

interface AddressFormData {
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  phoneNumber: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  visible: boolean;
  isEditing: boolean;
  addressForm: AddressFormData;
  isAddingAddress: boolean;
  isUpdatingAddress: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: AddressFormData) => void;
}

/* =======================
   PHONE VALIDATION
======================= */
const validatePhoneNumber = (phone: string) => {
  if (!phone) return false;

  // bỏ khoảng trắng
  let cleaned = phone.replace(/\s+/g, "");

  // nếu bắt đầu bằng +84 → đổi thành 0
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  }

  // chỉ cho phép số
  if (!/^0\d+$/.test(cleaned)) return false;

  // kiểm tra độ dài (VN: 9–10 số)
  if (cleaned.length < 9 || cleaned.length > 10) return false;

  return true;
};

const AddressFormModal = ({
  addressForm,
  isAddingAddress,
  isEditing,
  isUpdatingAddress,
  onClose,
  onFormChange,
  onSave,
  visible,
}: AddressFormModalProps) => {
  const handleSave = () => {
    if (!addressForm.phoneNumber.trim()) {
      Alert.alert("Invalid phone number", "Phone number is required");
      return;
    }

    if (!validatePhoneNumber(addressForm.phoneNumber)) {
      Alert.alert(
        "Invalid phone number",
        "Phone number must have 9–10 digits and be valid"
      );
      return;
    }

    onSave();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <SafeScreen>
          {/* HEADER */}
          <View className="px-6 py-5 border-b border-surface flex-row items-center justify-between">
            <Text className="text-text-primary text-2xl font-bold">
              {isEditing ? "Edit Address" : "Add New Address"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#C8A165" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="p-6">
              {/* LABEL */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-2">Label</Text>
                <TextInput
                  className="bg-surface text-text-primary p-4 rounded-2xl"
                  placeholder="Home, Work..."
                  placeholderTextColor="#666"
                  value={addressForm.label}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, label: text })
                  }
                />
              </View>

              {/* FULL NAME */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-2">Full Name</Text>
                <TextInput
                  className="bg-surface text-text-primary p-4 rounded-2xl"
                  placeholder="Your full name"
                  placeholderTextColor="#666"
                  value={addressForm.fullName}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, fullName: text })
                  }
                />
              </View>

              {/* STREET */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-2">Street Address</Text>
                <TextInput
                  className="bg-surface text-text-primary p-4 rounded-2xl"
                  placeholder="Street address"
                  placeholderTextColor="#666"
                  value={addressForm.streetAddress}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, streetAddress: text })
                  }
                  multiline
                />
              </View>

              {/* CITY */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-2">City</Text>
                <TextInput
                  className="bg-surface text-text-primary p-4 rounded-2xl"
                  placeholder="City"
                  placeholderTextColor="#666"
                  value={addressForm.city}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, city: text })
                  }
                />
              </View>

              {/* PHONE */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-2">Phone Number</Text>
                <TextInput
                  className="bg-surface text-text-primary p-4 rounded-2xl"
                  placeholder="0901234567 or +84901234567"
                  placeholderTextColor="#666"
                  value={addressForm.phoneNumber}
                  onChangeText={(text) =>
                    onFormChange({
                      ...addressForm,
                      phoneNumber: text.replace(/[^0-9+]/g, ""),
                    })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              {/* DEFAULT */}
              <View className="bg-surface rounded-2xl p-4 flex-row justify-between mb-6">
                <Text className="text-text-primary font-semibold">
                  Set as default address
                </Text>
                <Switch
                  value={addressForm.isDefault}
                  onValueChange={(value) =>
                    onFormChange({ ...addressForm, isDefault: value })
                  }
                />
              </View>

              {/* SAVE */}
              <TouchableOpacity
                className="bg-primary rounded-2xl py-5 items-center"
                onPress={handleSave}
                disabled={isAddingAddress || isUpdatingAddress}
              >
                {isAddingAddress || isUpdatingAddress ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <Text className="text-background font-bold text-lg">
                    {isEditing ? "Save Changes" : "Add Address"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeScreen>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressFormModal;
