import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";
import { MdDeleteForever, MdNotificationsNone, MdAddCircle } from "react-icons/md";
import Topbar from "./Topbar";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Base URL for the raw images in your GitHub repository
const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/";

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const Notify = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "post", postId));
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
    } catch (err) {
      console.error("Error deleting document: ", err);
      alert("Failed to delete the post. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAndDeletePosts = async () => {
      try {
        const q = query(collection(db, "post"), orderBy("upload_time", "desc"));
        const querySnapshot = await getDocs(q);

        const postsList = [];
        const oldPostsToDelete = [];
        const currentTime = new Date().getTime();

        querySnapshot.docs.forEach((document) => {
          const postData = { id: document.id, ...document.data() };

          const uploadTime =
            postData.upload_time instanceof Timestamp
              ? postData.upload_time.toDate().getTime()
              : new Date(postData.upload_time).getTime();

          if (currentTime - uploadTime >= TWENTY_FOUR_HOURS_IN_MS) {
            oldPostsToDelete.push(postData.id);
          } else {
            postsList.push(postData);
          }
        });

        if (oldPostsToDelete.length > 0) {
          await Promise.all(
            oldPostsToDelete.map((postId) =>
              deleteDoc(doc(db, "post", postId))
            )
          );
        }

        setPosts(postsList);
      } catch (err) {
        setError("Failed to process posts. Please check your Firestore rules.");
        console.error("Error fetching or deleting documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDeletePosts();
  }, []);

  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const loggedInRollNo = loggedInMember ? loggedInMember.roll_no : null;
  const isAdmin = loggedInMember ? loggedInMember.isAdmin : false;

  const handleNavigateToCreatePost = () => {
    navigate("/createpost");
  };

  const renderContent = () => {
    if (loading) return <Loader />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <p
            className="text-xl font-semibold"
            style={{ color: theme.colors.danger }}
          >
            {error}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 py-5 font-[Inter,sans-serif]">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <MdNotificationsNone
              className="text-8xl mb-4"
              style={{ color: theme.colors.secondary }}
            />
            <p
              className="text-xl font-semibold"
              style={{ color: theme.colors.neutralDark }}
            >
              No new notifications available.
            </p>
            {/* Added a button to create a post */}
            <button
              onClick={handleNavigateToCreatePost}
              className="mt-6 px-6 py-3 flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.neutralLight,
                fontFamily: theme.fonts.heading,
              }}
            >
              <MdAddCircle className="text-xl" />
              Write a Post
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const formattedTime =
              post.upload_time instanceof Timestamp
                ? post.upload_time.toDate().toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : post.upload_time;

            const showDeleteButton =
              isAdmin || post.roll_number === loggedInRollNo;

            const profileImageUrl = `${GITHUB_BASE_URL}${post.roll_number}.png`;

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {failedImages[post.roll_number] ? (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {post.name?.charAt(0) || "U"}
                      </div>
                    ) : (
                      <img
                        src={profileImageUrl}
                        alt={`${post.name}'s profile`}
                        className="w-11 h-11 rounded-full object-cover"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [post.roll_number]: true,
                          }))
                        }
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {post.name} {post.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{formattedTime}</p>
                    </div>
                  </div>

                  {showDeleteButton && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <MdDeleteForever className="text-xl text-red-500" />
                    </button>
                  )}
                </div>

                {/* Post Text */}
                {post.text_content && (
                  <div className="px-4 pb-2 text-base text-gray-800 whitespace-pre-wrap">
                    {post.text_content}
                  </div>
                )}

                {/* Post Image */}
                {post.image_link && (
                  <div className="w-full mt-2">
                    <img
                      src={post.image_link}
                      alt="Post"
                      className="w-full h-auto object-cover max-h-[450px] rounded-b-2xl"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <>
      <Topbar />
      <div className="p-4 max-w-2xl mx-auto py-14 bg-gray-100 min-h-screen">
        {renderContent()}
      </div>
    </>
  );
};

export default Notify;