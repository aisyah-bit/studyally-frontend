import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../pages/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Star, ArrowLeft, MessageSquare, Users } from "lucide-react";
import Layout from "../components/layout";
import "./StudySpotReview.css";

export default function StudySpotReview() {
  const location = useLocation();
  const { spotId } = useParams();
  const navigate = useNavigate();

  const [spotData, setSpotData] = useState({
    name: location.state?.spotName || "Unnamed Spot",
    location: location.state?.spotLocation || null,
  });

  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!spotId) {
      setError("No study spot selected");
      return;
    }

    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, `reviews/${spotId}/userReviews`);
        const q = query(reviewsRef, orderBy("timestamp", "desc"));
        const reviewSnap = await getDocs(q);

        const allReviews = [];
        const user = auth.currentUser;

        reviewSnap.forEach((doc) => {
          const data = doc.data();
          if (user && data.uid === user.uid) {
            setUserReview({ ...data, id: doc.id });
            setText(data.text);
            setRating(data.rating);
          }
          allReviews.push({
            ...data,
            id: doc.id,
            date: data.timestamp?.toDate().toLocaleDateString() || "",
          });
        });

        setReviews(allReviews);
        setError(null);
      } catch (err) {
        setError("Failed to load reviews");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [spotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in to leave a review");
      navigate("/login");
      return;
    }

    if (!text.trim() || rating === 0) {
      alert("Please provide both a review text and rating");
      return;
    }

    setSubmitting(true);
    try {
      await setDoc(doc(db, "reviews", spotId), {}, { merge: true });

      const reviewRef = doc(db, `reviews/${spotId}/userReviews/${user.uid}`);
      const payload = {
        uid: user.uid,
        email: user.email,
        text: text.trim(),
        rating,
        timestamp: new Date(),
        spotName: spotData.name,
      };

      await setDoc(reviewRef, payload);

      setUserReview(payload);
      setReviews((prev) => [
        { ...payload, id: user.uid, date: new Date().toLocaleDateString() },
        ...prev.filter((r) => r.id !== user.uid),
      ]);

      setText("");
      setRating(0);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="review-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="study-spot-review-page">
        <div className="review-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Back to Map
          </button>
          <h1 className="page-title">Reviews for {spotData.name}</h1>
        </div>

        <div className="content-layout">
          <div className="form-section">
            <h2 className="form-title">
              📝 {userReview ? "Update Your Review" : "Leave a Review"}
            </h2>

            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience..."
                required
                className="review-textarea"
              />

              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    className={`star ${rating >= num ? "filled" : ""}`}
                    onClick={() => setRating(num)}
                    size={20}
                  />
                ))}
                <span className="rating-text">({rating}/5)</span>
              </div>

              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting
                  ? "Processing..."
                  : userReview
                  ? "Update Review"
                  : "Submit Review"}
              </button>
            </form>
          </div>

          <div className="reviews-section">
            <h2 className="reviews-title">
              💬 All Reviews ({reviews.length})
            </h2>

            <div className="reviews-list">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Loading reviews...</div>
                </div>
              ) : reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`review-card ${
                      review.id === auth.currentUser?.uid ? "your-review" : ""
                    }`}
                  >
                    <div className="review-header-info">
                      <div className="reviewer-info">
                        <div className="reviewer-name">{review.email}</div>
                        <div className="review-date">{review.date}</div>
                      </div>
                      <div className="review-stars">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="star filled" size={14} />
                        ))}
                      </div>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
