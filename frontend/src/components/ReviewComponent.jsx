import React, { useEffect, useState } from "react";
import {
  getReviewsByTouristSpot,
  createReview,
  deleteReview,
  updateReview,
} from "../server/review-service";
import { FaStar, FaRegStar, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { LuX } from "react-icons/lu";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const StarRating = ({ rating, onRatingChange, interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${
            interactive
              ? "hover:scale-110 transition-transform cursor-pointer"
              : "cursor-default"
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          {star <= (hoverRating || rating) ? (
            <FaStar className="text-yellow-400 text-xl" />
          ) : (
            <FaRegStar className="text-gray-300 text-xl" />
          )}
        </button>
      ))}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      )}
    </div>
  );
};

const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const canModify = review.idUser === currentUserId || review.idUser?._id === currentUserId;
  const isCurrentUser = review.idUser === currentUserId || review.idUser?._id === currentUserId;
  const displayName = isCurrentUser ? 'You' : (review.idUser?.name || 'Anonymous User');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {isCurrentUser ? 'Y' : (review.idUser?.name?.charAt(0) || 'U')}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              {displayName}
            </h4>
            <p className="text-xs text-gray-500">
              {review.createdAt ? format(new Date(review.createdAt), 'd MMMM yyyy', { locale: id }) : 'Tanggal tidak tersedia'}
            </p>
          </div>
        </div>
        {canModify && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(review)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Edit Review"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={() => onDelete(review._id)}
              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete Review"
            >
              <FaTrash size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <StarRating rating={review.rating} />
      </div>
      
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    if (initialData) {
      setForm({ rating: initialData.rating, comment: initialData.comment });
    } else {
      setForm({ rating: 0, comment: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      alert("Silakan berikan rating!");
      return;
    }
    if (!form.comment.trim()) {
      alert("Silakan tulis komentar!");
      return;
    }
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            {initialData ? "Edit Review" : "Tulis Review"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <LuX size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Berikan Rating
              </label>
              <StarRating
                rating={form.rating}
                onRatingChange={(rating) => setForm({ ...form, rating })}
                interactive={true}
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Komentar
              </label>
              <textarea
                id="comment"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Ceritakan pengalaman Anda..."
                required
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                initialData ? "Update Review" : "Kirim Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReviewComponent = ({ idTouristSpot, idUser }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    const response = await getReviewsByTouristSpot(idTouristSpot);

    if (response.status === 200 && response.data?.data?.data) {
      // Sort reviews by creation date, newest first
      const sortedReviews = response.data.data.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setReviews(sortedReviews);
      setError("");
    } else {
      setError(response.message || "Gagal memuat review");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (idTouristSpot) {
      fetchReviews();
    }
  }, [idTouristSpot]);

  const handleOpenModal = (review = null) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (modalLoading) return;
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const handleSubmitReview = async (formData) => {
    setModalLoading(true);

    const reviewData = {
      idTouristSpot,
      idUser,
      rating: Number(formData.rating),
      comment: formData.comment,
    };

    try {
      let response;
      if (editingReview) {
        response = await updateReview(editingReview._id, reviewData);
        if (response.status === 200) {
          handleCloseModal();
          fetchReviews();
        } else {
          alert("Gagal mengupdate review: " + response.message);
        }
      } else {
        response = await createReview(reviewData);
        if (response.status === 201) {
          handleCloseModal();
          fetchReviews();
        } else {
          alert("Gagal membuat review: " + response.message);
        }
      }
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }

    setModalLoading(false);
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus review ini?")) {
      const response = await deleteReview(id);
      if (response.status === 200) {
        fetchReviews();
      } else {
        alert("Gagal menghapus review: " + response.message);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
        <p className="font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Review & Rating</h1>
              <p className="text-gray-600 mt-2">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} dari pengunjung
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2"
            >
              <FaPlus size={16} />
              Tulis Review
            </button>
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={idUser}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-400 mb-4">
                <FaStar size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Review
              </h3>
              <p className="text-gray-500 mb-6">
                Jadilah yang pertama memberikan review untuk tempat wisata ini!
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center gap-2"
              >
                <FaPlus size={16} />
                Tulis Review Pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReview}
        initialData={editingReview}
        loading={modalLoading}
      />
    </div>
  );
};

export default ReviewComponent;