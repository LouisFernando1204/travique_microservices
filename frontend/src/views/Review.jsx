// File: ReviewPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewComponent from '../components/ReviewComponent';

const Review = () => {
    const { touristSpotId } = useParams();
    
    const dummyTouristSpotId = "6652ac5e2c6cf9c49ce0f922"; // ID objek wisata dummy
    const dummyUserId = "6652b123456789abcdef1234"; // Default user ID dummy
    
    // Get current user ID (dengan fallback ke dummy)
    const getCurrentUserId = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            return user?.id || user?._id || dummyUserId; // Fallback ke dummy
        } catch {
            return dummyUserId; // Return dummy jika error
        }
    };

    const currentUserId = getCurrentUserId();
    
    const finalTouristSpotId = touristSpotId || dummyTouristSpotId;

    //Uncomment ini jika ingin validasi user login
    // if (!currentUserId) {
    //     return (
    //         <div className="container mx-auto px-4 py-8">
    //             <div className="text-center">
    //                 <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
    //                 <p>Silakan login terlebih dahulu untuk melihat review.</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div>
            {/* Debug info (hapus di production) */}
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p><strong>Debug Info:</strong></p>
                <p>Tourist Spot ID: {finalTouristSpotId}</p>
                <p>User ID: {currentUserId}</p>
                <p>Using: {touristSpotId ? 'URL Param' : 'Dummy'} tourist spot ID</p>
            </div>

            <ReviewComponent
                idTouristSpot={finalTouristSpotId} // Dari URL params atau dummy
                idUser={currentUserId}             // Dari localStorage atau dummy
            />
        </div>
    );
};

export default Review;

// import React, { useEffect, useState } from "react";
// import {
//   getReviewsByTouristSpot,
//   createReview,
//   deleteReview,
//   updateReview,
// } from "../server/review-service";

// const Review = () => {
//   const [reviews, setReviews] = useState([]);
//   const [form, setForm] = useState({ rating: "", comment: "" });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editingId, setEditingId] = useState(null);

//   const idTourist = "6652ac5e2c6cf9c49ce0f922"; // ID objek wisata
//   const defaultUserId = "6652b123456789abcdef1234"; // Default user ID

//   const fetchReviews = async () => {
//     setLoading(true);
//     const response = await getReviewsByTouristSpot(idTourist);

//     if (response.status === 200 && response.data?.data?.data) {
//       setReviews(response.data.data.data);
//       setError("");
//     } else {
//       setError(response.message || "Failed to fetch reviews");
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchReviews();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const reviewData = {
//       idTouristSpot: idTourist,
//       idUser: defaultUserId,
//       rating: Number(form.rating),
//       comment: form.comment,
//     };

//     if (editingId) {
//       const response = await updateReview(editingId, reviewData);
//       if (response.status === 200) {
//         setEditingId(null);
//         setForm({ rating: "", comment: "" });
//         fetchReviews();
//       } else {
//         alert("Failed to update review: " + response.message);
//       }
//     } else {
//       const response = await createReview(reviewData);
//       if (response.status === 201) {
//         setForm({ rating: "", comment: "" });
//         fetchReviews();
//       } else {
//         alert("Failed to create review: " + response.message);
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this review?")) {
//       const response = await deleteReview(id);
//       if (response.status === 200) {
//         fetchReviews();
//       } else {
//         alert("Failed to delete review: " + response.message);
//       }
//     }
//   };

//   const handleEdit = (review) => {
//     setEditingId(review._id);
//     setForm({ rating: review.rating.toString(), comment: review.comment });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setForm({ rating: "", comment: "" });
//   };

//   if (loading) return <p>Loading reviews...</p>;
//   if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

//   return (
//     <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
//       <h1>Reviews for Tourist Spot</h1>

//       {reviews.length > 0 ? (
//         <ul>
//           {reviews.map((review) => (
//             <li key={review._id} style={{ marginBottom: "10px" }}>
//               <strong>Rating:</strong> {review.rating} <br />
//               <strong>Comment:</strong> {review.comment} <br />
//               {review.idUser === defaultUserId ||
//               review.idUser?._id === defaultUserId ? (
//                 <>
//                   <button
//                     onClick={() => handleDelete(review._id)}
//                     style={{ marginRight: "10px" }}
//                   >
//                     Delete
//                   </button>
//                   <button onClick={() => handleEdit(review)}>Edit</button>
//                 </>
//               ) : null}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p style={{ fontStyle: "italic", color: "gray" }}>
//           Belum ada ulasan untuk objek wisata ini. Jadilah yang pertama
//           memberikan review!
//         </p>
//       )}

//       <h2>{editingId ? "Edit Review" : "Add a Review"}</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Rating (1-5): </label>
//           <input
//             type="number"
//             min="1"
//             max="5"
//             value={form.rating}
//             onChange={(e) => setForm({ ...form, rating: e.target.value })}
//             required
//           />
//         </div>
//         <div>
//           <label>Comment: </label>
//           <textarea
//             value={form.comment}
//             onChange={(e) => setForm({ ...form, comment: e.target.value })}
//             required
//           />
//         </div>
//         <button type="submit">
//           {editingId ? "Update Review" : "Submit Review"}
//         </button>
//         {editingId && (
//           <button
//             type="button"
//             onClick={handleCancelEdit}
//             style={{ marginLeft: "10px" }}
//           >
//             Cancel
//           </button>
//         )}
//       </form>
//     </div>
//   );
// };

// export default Review;


