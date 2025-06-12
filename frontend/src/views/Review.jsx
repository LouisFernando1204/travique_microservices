import React, { useEffect, useState } from "react";
import {
  getReviewsByTouristSpot,
  createReview,
  deleteReview,
  updateReview,
} from "../server/review-service";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: "", comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const idTourist = "6652ac5e2c6cf9c49ce0f922"; // ID objek wisata
  const defaultUserId = "6652b123456789abcdef1234"; // Default user ID

  const fetchReviews = async () => {
    setLoading(true);
    const response = await getReviewsByTouristSpot(idTourist);

    if (response.status === 200 && response.data?.data?.data) {
      setReviews(response.data.data.data);
      setError("");
    } else {
      setError(response.message || "Failed to fetch reviews");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reviewData = {
      idTouristSpot: idTourist,
      idUser: defaultUserId,
      rating: Number(form.rating),
      comment: form.comment,
    };

    if (editingId) {
      const response = await updateReview(editingId, reviewData);
      if (response.status === 200) {
        setEditingId(null);
        setForm({ rating: "", comment: "" });
        fetchReviews();
      } else {
        alert("Failed to update review: " + response.message);
      }
    } else {
      const response = await createReview(reviewData);
      if (response.status === 201) {
        setForm({ rating: "", comment: "" });
        fetchReviews();
      } else {
        alert("Failed to create review: " + response.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const response = await deleteReview(id);
      if (response.status === 200) {
        fetchReviews();
      } else {
        alert("Failed to delete review: " + response.message);
      }
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setForm({ rating: review.rating.toString(), comment: review.comment });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ rating: "", comment: "" });
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Reviews for Tourist Spot</h1>

      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review._id} style={{ marginBottom: "10px" }}>
              <strong>Rating:</strong> {review.rating} <br />
              <strong>Comment:</strong> {review.comment} <br />
              {review.idUser === defaultUserId ||
              review.idUser?._id === defaultUserId ? (
                <>
                  <button
                    onClick={() => handleDelete(review._id)}
                    style={{ marginRight: "10px" }}
                  >
                    Delete
                  </button>
                  <button onClick={() => handleEdit(review)}>Edit</button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontStyle: "italic", color: "gray" }}>
          Belum ada ulasan untuk objek wisata ini. Jadilah yang pertama
          memberikan review!
        </p>
      )}

      <h2>{editingId ? "Edit Review" : "Add a Review"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating (1-5): </label>
          <input
            type="number"
            min="1"
            max="5"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Comment: </label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            required
          />
        </div>
        <button type="submit">
          {editingId ? "Update Review" : "Submit Review"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default Review;
