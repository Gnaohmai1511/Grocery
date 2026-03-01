import { User } from "../models/user.model.js";

export async function addAddress(req, res) {
  try {
    const { label, fullName, streetAddress, city, phoneNumber, isDefault } =
      req.body;

    const user = req.user;

    if (!fullName || !streetAddress || !city) {
      return res.status(400).json({
        error: "Thiếu thông tin bắt buộc của địa chỉ",
      });
    }

    // nếu đặt làm mặc định thì bỏ mặc định các địa chỉ khác
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      message: "Thêm địa chỉ thành công",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in addAddress controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = req.user;

    res.status(200).json({
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in getAddresses controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function updateAddress(req, res) {
  try {
    const { label, fullName, streetAddress, city, phoneNumber, isDefault } =
      req.body;

    const { addressId } = req.params;

    const user = req.user;
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        error: "Không tìm thấy địa chỉ",
      });
    }

    // nếu đặt làm mặc định thì bỏ mặc định các địa chỉ khác
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault =
      isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      message: "Cập nhật địa chỉ thành công",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in updateAddress controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      message: "Xoá địa chỉ thành công",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in deleteAddress controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    // kiểm tra sản phẩm đã có trong wishlist chưa
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        error: "Sản phẩm đã có trong danh sách yêu thích",
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      message: "Đã thêm sản phẩm vào danh sách yêu thích",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in addToWishlist controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    // kiểm tra sản phẩm có trong wishlist không
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        error: "Sản phẩm không tồn tại trong danh sách yêu thích",
      });
    }

    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({
      message: "Đã xoá sản phẩm khỏi danh sách yêu thích",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in removeFromWishlist controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}

export async function getWishlist(req, res) {
  try {
    // populate vì wishlist chỉ lưu id sản phẩm
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in getWishlist controller:", error);
    res.status(500).json({
      error: "Lỗi máy chủ nội bộ",
    });
  }
}