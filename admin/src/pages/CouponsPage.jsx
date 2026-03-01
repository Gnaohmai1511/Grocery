import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "../lib/api.js";

function CouponsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true,
  });

  const queryClient = useQueryClient();

  /* ================= FETCH ================= */
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: couponApi.getAll,
  });

  /* ================= MUTATIONS ================= */
  const createMutation = useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: couponApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: couponApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  /* ================= HANDLERS ================= */
  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minOrderAmount: "",
      maxDiscount: "",
      expiresAt: "",
      usageLimit: "",
      isActive: true,
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      expiresAt: coupon.expiresAt.slice(0, 10),
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      value: Number(formData.value),
      minOrderAmount: Number(formData.minOrderAmount || 0),
      maxDiscount: formData.maxDiscount
        ? Number(formData.maxDiscount)
        : undefined,
      usageLimit: formData.usageLimit
        ? Number(formData.usageLimit)
        : undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mã giảm giá</h1>
          <p className="text-base-content/70 mt-1">
            Quản lý các mã giảm giá
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm mã giảm giá
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{coupon.code}</h3>
                  <p className="text-sm opacity-70">
                    {coupon.type === "percentage"
                      ? `Giảm ${coupon.value}%`
                      : `Giảm ${Number(coupon.value).toLocaleString("vi-VN")} ₫`}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Hết hạn:{" "}
                    {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      coupon.isActive ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {coupon.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>

                  <button
                    className="btn btn-square btn-ghost"
                    onClick={() => handleEdit(coupon)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    className="btn btn-square btn-ghost text-error"
                    onClick={() => deleteMutation.mutate(coupon._id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />
      <div className="modal">
        <div className="modal-box max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {editingCoupon ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input input-bordered w-full"
              placeholder="Mã giảm giá"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase(),
                })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="select select-bordered"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>

              <input
                type="number"
                className="input input-bordered"
                placeholder="Giá trị giảm"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
              />
            </div>

            <input
              type="date"
              className="input input-bordered w-full"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
              required
            />

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editingCoupon ? "Cập nhật" : "Tạo mã"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CouponsPage;