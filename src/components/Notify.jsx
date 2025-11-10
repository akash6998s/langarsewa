import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";
import {
  MdDeleteForever,
  MdNotificationsNone,
  MdAddCircle,
  MdThumbUp,
  MdComment,
  MdSend,
  MdClose,
  MdOutlineAccessTime,
  MdVerified,
  MdMoreVert,
} from "react-icons/md";
import Topbar from "./Topbar";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

// --- Configuration Constants & Utility Functions ---
const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"];
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const getLoggedInUserData = () => {
  try {
    const memberData = JSON.parse(localStorage.getItem("loggedInMember"));
    return {
      roll_no: memberData ? memberData.roll_no : null,
      name: memberData ? memberData.name : "Unknown",
      last_name: memberData ? memberData.last_name : "",
      // ADDED: Retrieve isSuperAdmin flag
      isSuperAdmin: memberData ? memberData.isSuperAdmin : false,
    };
  } catch (e) {
    console.error("Error parsing loggedInMember from localStorage:", e);
    return { roll_no: null, name: "Unknown", last_name: "", isSuperAdmin: false };
  }
};

const formatTimestamp = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  try {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Unknown Time";
  }
};

// ----------------------------------------------------------------------
// 1. PostMenuDropdown Component (No change)
// ----------------------------------------------------------------------
const PostMenuDropdown = ({ postId, showDeleteButton, onDeletePost }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    onDeletePost(postId);
    setIsOpen(false);
  };

  if (!showDeleteButton) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Post Options"
      >
        <MdMoreVert className="text-xl" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={handleDeleteClick}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <MdDeleteForever className="mr-2 text-lg" />
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 1.5. CommentMenuDropdown Component (No change to logic, just cleanup)
// ----------------------------------------------------------------------
const CommentMenuDropdown = ({ comment, postId, loggedInRollNo, isAdmin, onDeleteComment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // User can delete their own comments OR an admin can delete any comment
    const showDeleteButton = isAdmin || (loggedInRollNo && comment.roll_no === loggedInRollNo);
    
    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteClick = () => {
        onDeleteComment(postId, comment); 
        setIsOpen(false);
    };

    if (!showDeleteButton) return null;

    return (
        <div className="relative ml-2 flex-shrink-0" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors self-start mt-2"
                title="Comment Options"
            >
                <MdMoreVert className="text-sm" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-6 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                        onClick={handleDeleteClick}
                        className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                        <MdDeleteForever className="mr-1.5 text-base" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};


// ----------------------------------------------------------------------
// 2. InteractionsModal Component (No change here, props passed correctly)
// ----------------------------------------------------------------------
const InteractionsModal = ({
  interactionState,
  onClose,
  profileImageUrls,
  memberDetails,
  onDeleteComment,
  loggedInRollNo,
  isAdmin,
}) => {
  if (!interactionState || !interactionState.post) return null;

  const { post, initialTab } = interactionState;
  const [activeTab, setActiveTab] = useState(initialTab || "likes");

  const likes = post.likes || [];
  const comments = post.comments || [];
  const postTime = formatTimestamp(post.upload_time);

  const sortedComments = [...comments].sort((a, b) => {
    const timeA =
      a.timestamp instanceof Timestamp
        ? a.timestamp.toMillis()
        : new Date(a.timestamp).getTime();
    const timeB =
      b.timestamp instanceof Timestamp
        ? b.timestamp.toMillis()
        : new Date(b.timestamp).getTime();
    return timeB - timeA; // Newest first
  });

  const renderLikesTab = () => (
    <div className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">
      {likes.length === 0 ? (
        <p className="text-center text-gray-500 mt-5 text-sm">
          Be the first to like this post!
        </p>
      ) : (
        likes.map((rollNo, index) => {
          const member = memberDetails[rollNo];
          const fullName = member
            ? `${member.name} ${member.last_name}`.trim()
            : `Loading...`;
          const isPlaceholder = !member;

          const profileImageUrl = profileImageUrls[rollNo];
          const hasProfileImage =
            profileImageUrl !== null && profileImageUrl !== undefined;

          return (
            <div
              key={rollNo || index}
              className="flex items-start mt-1 p-2 rounded-lg transition-colors hover:bg-blue-50/50"
            >
              {/* Profile Image/Icon */}
              {hasProfileImage ? (
                <img
                  src={profileImageUrl}
                  alt={fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 flex-shrink-0 mr-3 mt-0.5"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0 mr-3 mt-0.5">
                  {fullName.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="text-sm flex-grow">
                <p
                  className={`font-semibold ${
                    isPlaceholder ? "text-gray-500 italic" : "text-gray-800"
                  }`}
                >
                  {isPlaceholder ? `Fetching details...` : fullName}
                </p>
                <div className="text-gray-400 text-[10px] flex items-center">
                  {postTime}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderCommentsTab = () => (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
      {sortedComments.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-sm">
          No comments yet. Start the conversation!
        </p>
      ) : (
        sortedComments.map((comment, index) => {
          const commenterRollNo = comment.roll_no;
          const profileImageUrl = profileImageUrls[commenterRollNo];
          const hasProfileImage =
            profileImageUrl !== null && profileImageUrl !== undefined;

          return (
            <div key={index} className="flex items-start justify-between">
              <div className="flex items-start flex-grow">
                {/* Commenter Profile Image/Icon */}
                {hasProfileImage ? (
                  <img
                    src={profileImageUrl}
                    alt={`${comment.name}'s profile`}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 flex-shrink-0 mr-2 mt-1"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-medium flex-shrink-0 mr-2 mt-1">
                    {comment.name?.charAt(0) || "U"}
                  </div>
                )}

                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
                  <p className="font-bold text-gray-900 text-xs mb-1">
                    {(comment.name || "Member") + " " + (comment.last_name || "")}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap leading-snug">
                    {comment.text}
                  </p>
                  {/* Timestamp below comment text */}
                  {comment.timestamp && (
                    <div className="text-gray-500 text-[10px] mt-1 flex items-center">
                      <MdOutlineAccessTime className="mr-0.5" />
                      {formatTimestamp(comment.timestamp)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Comment Menu Dropdown */}
              <CommentMenuDropdown
                postId={post.id}
                comment={comment}
                loggedInRollNo={loggedInRollNo}
                isAdmin={isAdmin}
                onDeleteComment={onDeleteComment}
              />
            </div>
          );
        })
      )}
    </div>
  );

  // Tab styles
  const tabClass =
    "flex-1 text-center py-3 text-sm font-bold transition-colors";
  const activeTabClass = "text-blue-600 border-b-2 border-blue-600";
  const inactiveTabClass =
    "text-gray-500 hover:bg-gray-100 border-b-2 border-transparent";

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 z-50 flex items-end justify-center backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full h-[90%] max-w-lg rounded-t-3xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {activeTab === "comments" ? "Post Comments" : "Post Likes"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* TAB NAVIGATION: Likes is now first, Comments is second */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("likes")}
            className={`${tabClass} ${
              activeTab === "likes" ? activeTabClass : inactiveTabClass
            }`}
          >
            Likes ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`${tabClass} ${
              activeTab === "comments" ? activeTabClass : inactiveTabClass
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "likes" && renderLikesTab()}
        {activeTab === "comments" && renderCommentsTab()}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. PostActions Component (No change)
// ----------------------------------------------------------------------
const PostActions = ({
  post,
  currentRollNo,
  onLikeToggle,
  onCommentClick,
  onLikesClick,
}) => {
  const hasLiked = post.likes && post.likes.includes(currentRollNo);
  const likeCount = post.likes ? post.likes.length : 0;
  const commentCount = post.comments ? post.comments.length : 0;

  const handleLikeClick = () => {
    if (!currentRollNo) {
      alert("Please log in to like a post.");
      return;
    }
    onLikeToggle(post.id, hasLiked);
  };

  return (
    <div className="px-4">
      {/* Counts Line (Social Proof) */}
      <div className="flex justify-between items-center text-xs text-gray-500 py-3 border-b border-gray-100">
        {/* Likes Display - Clickable */}
        {likeCount > 0 ? (
          <button
            onClick={() => onLikesClick(post)}
            className="flex items-center gap-1 cursor-pointer font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MdThumbUp className="text-blue-500 w-4 h-4" />
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          </button>
        ) : (
          <div></div>
        )}

        {/* Comments Display (Opens modal on click) */}
        {commentCount > 0 && (
          <button
            onClick={() => onCommentClick(post)}
            className="cursor-pointer font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </span>
          </button>
        )}
      </div>

      {/* Action Buttons (Like & Comment) */}
      <div className="flex justify-around items-center py-2">
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`flex items-center justify-center w-1/2 gap-2 p-2 rounded-full transition-all duration-200 text-sm font-semibold ${
            hasLiked
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <MdThumbUp className="text-xl" />
          <span>{hasLiked ? "Liked" : "Like"}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onCommentClick(post)}
          className="flex items-center justify-center w-1/2 gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-sm font-semibold"
        >
          <MdComment className="text-xl" />
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. CommentInputField Component (No change)
// ----------------------------------------------------------------------
const CommentInputField = ({ postId, userData, onCommentSubmit }) => {
  const [commentText, setCommentText] = useState("");
  const rollNo = userData.roll_no;
  const isPostDisabled = !rollNo || commentText.trim().length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPostDisabled) return;

    const newComment = {
      text: commentText.trim(),
      roll_no: rollNo,
      name: userData.name,
      last_name: userData.last_name,
      timestamp: Timestamp.now(),
    };

    onCommentSubmit(postId, newComment);
    setCommentText("");
  };

  return (
    <div className="px-4 pb-3 pt-1 border-t border-gray-100">
      <form onSubmit={handleSubmit} className="flex items-center mt-2 w-full">
        <div className="flex flex-grow items-center bg-gray-50 rounded-full pr-1 h-10 border border-gray-200">
          <input
            type="text"
            placeholder={rollNo ? "Add a comment..." : "Log in to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-grow bg-transparent outline-none text-sm px-4 h-full placeholder-gray-500"
            disabled={!rollNo}
          />
          <button
            type="submit"
            className={`p-1 rounded-full transition-colors ${
              isPostDisabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-600 hover:text-white"
            }`}
            disabled={isPostDisabled}
          >
            <MdSend className="text-xl" />
          </button>
        </div>
      </form>
      {!rollNo && (
        <p className="text-xs text-red-500 mt-1 text-center">
          You must be logged in to comment.
        </p>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. Notify Component (Main Feed) - UPDATED
// ----------------------------------------------------------------------
const Notify = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImageUrls, setProfileImageUrls] = useState({});
  const [interactionState, setInteractionState] = useState(null);
  const [likedMemberDetails, setLikedMemberDetails] = useState({});

  const navigate = useNavigate();

  const userData = getLoggedInUserData();
  const loggedInRollNo = userData.roll_no;
  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  // Use isAdmin for comment deletion (as before)
  const isAdmin = loggedInMember ? loggedInMember.isAdmin : false; 
  // NEW: Use isSuperAdmin for post deletion
  const isSuperAdmin = loggedInMember ? loggedInMember.isSuperAdmin : false; 


  // Unified Modal Handlers
  const openModal = useCallback((post, initialTab) => {
    setInteractionState({ post, initialTab });
    const rollNumbers = [
      ...(post.likes || []),
      ...(post.comments || []).map((c) => c.roll_no),
    ].filter(Boolean);

    if (rollNumbers.length > 0) {
      fetchLikedMemberDetails(rollNumbers);
    }
  }, []);

  const closeInteractionModal = useCallback(() => {
    setInteractionState(null);
    setLikedMemberDetails({});
  }, []);

  const openCommentsModal = useCallback(
    (post) => {
      openModal(post, "comments");
    },
    [openModal]
  );

  const openLikesModal = useCallback(
    (post) => {
      openModal(post, "likes");
    },
    [openModal]
  );

  const fetchLikedMemberDetails = useCallback(async (rollNumbers) => {
    if (rollNumbers.length === 0) {
      setLikedMemberDetails({});
      return;
    }

    const details = {};
    const memberCollectionRef = collection(db, "members");

    const chunks = [];
    const uniqueRollNumbers = [...new Set(rollNumbers)];

    for (let i = 0; i < uniqueRollNumbers.length; i += 10) {
      chunks.push(uniqueRollNumbers.slice(i, i + 10));
    }

    try {
      await Promise.all(
        chunks.map(async (chunk) => {
          const q = query(memberCollectionRef, where("roll_no", "in", chunk));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.roll_no) {
              details[data.roll_no] = {
                name: data.name,
                last_name: data.last_name || "",
              };
            }
          });
        })
      );

      setLikedMemberDetails(details);
    } catch (error) {
      console.error("Error fetching liked member details:", error);
    }
  }, []);

  const handleCommentSubmit = useCallback(
    async (postId, newComment) => {
      const postRef = doc(db, "post", postId);
      try {
        await updateDoc(postRef, {
          comments: arrayUnion(newComment),
        });

        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              const updatedComments = [...(post.comments || []), newComment];
              if (interactionState && interactionState.post.id === postId) {
                setInteractionState((prev) => ({
                  ...prev,
                  post: { ...prev.post, comments: updatedComments },
                }));
              }
              return { ...post, comments: updatedComments };
            }
            return post;
          })
        );
        if (!likedMemberDetails[newComment.roll_no]) {
          fetchLikedMemberDetails([newComment.roll_no]);
        }
      } catch (err) {
        console.error("Error submitting comment:", err);
        alert("Failed to submit comment. Please try again.");
      }
    },
    [interactionState, likedMemberDetails, fetchLikedMemberDetails]
  );

  // Comment Deletion Handler (No change)
  const handleDeleteComment = useCallback(async (postId, commentToRemove) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment?"
      )
    )
      return;

    const postRef = doc(db, "post", postId);
    
    try {
        await updateDoc(postRef, {
            comments: arrayRemove(commentToRemove),
        });

        setPosts((currentPosts) =>
            currentPosts.map((post) => {
                if (post.id === postId) {
                    const updatedComments = post.comments.filter(
                        c => 
                            c.roll_no !== commentToRemove.roll_no || 
                            c.text !== commentToRemove.text || 
                            !c.timestamp.isEqual(commentToRemove.timestamp)
                    );

                    if (interactionState && interactionState.post.id === postId) {
                        setInteractionState((prev) => ({
                            ...prev,
                            post: { ...prev.post, comments: updatedComments },
                        }));
                    }
                    
                    return { ...post, comments: updatedComments };
                }
                return post;
            })
        );
    } catch (err) {
        console.error("Error deleting comment:", err);
        alert("Failed to delete the comment. Please try again.");
    }
  }, [interactionState]);


  const handleLikeToggle = useCallback(
    async (postId, currentlyLiked) => {
      const postRef = doc(db, "post", postId);
      if (!loggedInRollNo) return;

      const action = currentlyLiked
        ? arrayRemove(loggedInRollNo)
        : arrayUnion(loggedInRollNo);

      try {
        await updateDoc(postRef, {
          likes: action,
        });

        let newLikes = [];

        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              newLikes = currentlyLiked
                ? post.likes.filter((roll) => roll !== loggedInRollNo)
                : [...(post.likes || []), loggedInRollNo];

              if (interactionState && interactionState.post.id === postId) {
                setInteractionState((prev) => ({
                  ...prev,
                  post: { ...prev.post, likes: newLikes },
                }));
              }

              return { ...post, likes: newLikes };
            }
            return post;
          })
        );

        if (interactionState && interactionState.post.id === postId) {
          fetchLikedMemberDetails(
            interactionState.post.comments
              .map((c) => c.roll_no)
              .concat(newLikes)
          );
        }
      } catch (err) {
        console.error("Error updating like:", err);
        alert("Failed to update like status. Please try again.");
      }
    },
    [loggedInRollNo, interactionState, fetchLikedMemberDetails]
  );

  const handleDeletePost = async (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action is permanent."
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "post", postId));
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
      if (interactionState && interactionState.post.id === postId) {
        closeInteractionModal();
      }
    } catch (err) {
      console.error("Error deleting document: ", err);
      alert("Failed to delete the post. Please try again.");
    }
  };

  const getProfileImageUrl = async (rollNumber) => {
    if (profileImageUrls[rollNumber] !== undefined) {
      return profileImageUrls[rollNumber];
    }
    for (const ext of IMAGE_EXTENSIONS) {
      const url = `${GITHUB_BASE_URL}${rollNumber}.${ext}`;
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (response.ok) {
          setProfileImageUrls((prev) => ({ ...prev, [rollNumber]: url }));
          return url;
        }
      } catch (e) {
        // Silent error for file not found is expected
      }
    }
    setProfileImageUrls((prev) => ({ ...prev, [rollNumber]: null }));
    return null;
  };

  useEffect(() => {
    const fetchAndProcessPosts = async () => {
      try {
        const q = query(collection(db, "post"), orderBy("upload_time", "desc"));
        const querySnapshot = await getDocs(q);

        const postsList = [];
        const oldPostsToDelete = [];
        const currentTime = new Date().getTime();

        const postsToProcess = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            likes: data.likes || [],
            comments: data.comments || [],
          };
        });

        const allRollNumbers = new Set(
          postsToProcess.flatMap((post) =>
            [
              post.roll_number,
              ...(post.likes || []),
              ...(post.comments || []).map((c) => c.roll_no),
            ].filter(Boolean)
          )
        );

        const profileUrlPromises = Array.from(allRollNumbers).map((rollNo) =>
          getProfileImageUrl(rollNo)
        );
        await Promise.all(profileUrlPromises);

        postsToProcess.forEach((postData) => {
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
            oldPostsToDelete.map((postId) => deleteDoc(doc(db, "post", postId)))
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
    fetchAndProcessPosts();
  }, []);

  const handleNavigateToCreatePost = () => {
    navigate("/createpost");
  };

  const renderContent = () => {
    if (loading) return <Loader />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <p className="text-xl font-semibold text-red-600">{error}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 py-1 font-[Inter,sans-serif]">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 mt-12">
            <MdNotificationsNone className="text-8xl mb-4 text-gray-300" />
            <p className="text-xl font-bold text-gray-700">
              No Recent Activity
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Posts are removed after 24 hours.
            </p>
            <button
              onClick={handleNavigateToCreatePost}
              className="px-6 py-3 flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] bg-blue-600 text-white font-bold"
            >
              <MdAddCircle className="text-xl" />
              Create New Post
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const formattedTime = formatTimestamp(post.upload_time);

            // UPDATED LOGIC: Show delete button if user is post owner OR Super Admin
            const showDeleteButton =
              isSuperAdmin || post.roll_number === loggedInRollNo;

            const profileImageUrl = profileImageUrls[post.roll_number];
            const hasProfileImage = profileImageUrl !== null;

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mx-2 sm:mx-0"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {/* Profile Image/Icon */}
                    {hasProfileImage ? (
                      <img
                        src={profileImageUrl}
                        alt={`${post.name}'s profile`}
                        className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-lg flex-shrink-0">
                        {post.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center">
                        {post.name} {post.last_name}
                        {post.roll_number === "ADMIN_ROLL" && (
                          <MdVerified className="text-blue-500 ml-1 text-xs" />
                        )}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <MdOutlineAccessTime className="inline-block mr-1 align-sub" />
                        {formattedTime}
                      </p>
                    </div>
                  </div>

                  {/* THREE DOTS MENU */}
                  <PostMenuDropdown
                    postId={post.id}
                    showDeleteButton={showDeleteButton}
                    onDeletePost={handleDeletePost}
                  />
                </div>

                {/* Post Content (Text) */}
                {post.text_content && (
                  <div className="px-4 pb-2 text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.text_content}
                  </div>
                )}

                {/* Post Content (Image) */}
                {post.image_link && (
                  <div className="w-full mt-2 mb-2 bg-gray-100">
                    <img
                      src={post.image_link}
                      alt="Post"
                      className="w-full h-auto object-cover max-h-[500px] border-t border-b border-gray-200"
                    />
                  </div>
                )}

                {/* Action Bar & Comment Input */}
                <PostActions
                  post={post}
                  currentRollNo={loggedInRollNo}
                  onLikeToggle={handleLikeToggle}
                  onCommentClick={openCommentsModal}
                  onLikesClick={openLikesModal}
                />

                <CommentInputField
                  postId={post.id}
                  userData={userData}
                  onCommentSubmit={handleCommentSubmit}
                />
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
      {/* Outer wrapper mimicking a mobile device feed area */}
      <div className="p-0 max-w-xl mx-auto py-14 bg-gray-50 min-h-screen shadow-2xl">
        {renderContent()}
      </div>
      {/* RENDER THE UNIFIED INTERACTIONS MODAL */}
      {interactionState && (
        <InteractionsModal
          interactionState={interactionState}
          onClose={closeInteractionModal}
          profileImageUrls={profileImageUrls}
          memberDetails={likedMemberDetails}
          // Props for comment deletion
          onDeleteComment={handleDeleteComment}
          loggedInRollNo={loggedInRollNo}
          isAdmin={isAdmin} // Keeping 'isAdmin' for comment deletion access
        />
      )}
    </>
  );
};

export default Notify;