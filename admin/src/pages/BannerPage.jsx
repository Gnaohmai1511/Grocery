import { useState } from "react";
import { PlusIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerApi } from "../lib/api";

function BannerPage() {
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const queryClient = useQueryClient();

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bannerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setImages([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (images.length === 0) {
      return alert("Vui lòng chọn ảnh banner");
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner</h1>
          <p className="text-base-content/70 mt-1">
            Quản lý banner quảng cáo
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm banner
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner._id} className="card bg-base-100 shadow-xl">
            <figure className="p-4">
              <img
                src={banner.image}
                className="rounded-xl w-full h-40 object-cover"
              />
            </figure>

            <div className="card-body p-4">
              <div className="card-actions justify-end">
                <button
                  className="btn btn-square btn-ghost text-error"
                  onClick={() => deleteMutation.mutate(banner._id)}
                >
                  {deleteMutation.isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <Trash2Icon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />

      <div className="modal">
        <div className="modal-box max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">Thêm banner</h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label flex items-center gap-2 font-semibold">
                <ImageIcon className="w-5 h-5" />
                Hình ảnh banner
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="file-input file-input-bordered file-input-primary w-full"
              />

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="avatar">
                      <div className="w-24 rounded-lg">
                        <img src={preview} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button type="button" onClick={closeModal} className="btn">
                Hủy
              </button>

              <button type="submit" className="btn btn-primary">
                {createMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Thêm"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BannerPage;