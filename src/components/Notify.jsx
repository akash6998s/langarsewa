import React, { useState, useEffect, useCallback, useRef } from "react";
import { collection, query, getDocs, orderBy, deleteDoc, doc, Timestamp, updateDoc, arrayUnion, arrayRemove, where } from "firebase/firestore";
import { db } from "../firebase";
import { MdDeleteForever, MdNotificationsNone, MdAddCircle, MdThumbUp, MdComment, MdSend, MdClose, MdOutlineAccessTime, MdVerified, MdMoreVert } from "react-icons/md";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

const GITHUB_BASE_URL = "https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/";
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"];
const TWENTY_FOUR_HOURS_IN_MS = 86400000;
const getLoggedUser = () => { try { const m=JSON.parse(localStorage.getItem("loggedInMember")); return { roll_no: m?.roll_no||null, name: m?.name||"Unknown", last_name: m?.last_name||"", isSuperAdmin: m?.isSuperAdmin||false, isAdmin: m?.isAdmin||false }; } catch (e) { return { roll_no: null, name: "Unknown", last_name: "", isSuperAdmin: false, isAdmin: false }; } };
const formatTs = (ts) => { if (!ts) return "Unknown Time"; try { return (ts instanceof Timestamp ? ts.toDate() : new Date(ts)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return "Unknown Time"; } };

const ZoomModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-red-400 z-[101] p-2 rounded-full transition-colors" aria-label="Close Zoom">
            <MdClose />
        </button>
        <div className="w-full h-full max-w-full max-h-full overflow-auto" style={{ touchAction: 'pan-x pan-y' }}>
            <img 
                src={imageUrl} 
                alt="Zoomed Post Image" 
                className="block object-contain w-full h-full cursor-zoom-out" 
                onClick={onClose} 
            />
        </div>
    </div>
);

const ProfilePic = (rollNo, name, lastName, url) => url ? ( <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 flex-shrink-0 mr-3 mt-0.5" /> ) : ( <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0 mr-3 mt-0.5">{name?.charAt(0).toUpperCase() || "U"}</div> );

const MenuDropdown = ({ postId, showDeleteButton, onDeletePost, isComment, comment, loggedInRollNo, isAdmin, onDeleteComment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const showBtn = isComment ? (isAdmin || (loggedInRollNo && comment.roll_no === loggedInRollNo)) : showDeleteButton;
    const handleDelete = () => { isComment ? onDeleteComment(postId, comment) : onDeletePost(postId); setIsOpen(false); };
    useEffect(() => { const h=(e)=>dropdownRef.current&&!dropdownRef.current.contains(e.target)&&setIsOpen(false); document.addEventListener("mousedown", h); return ()=>document.removeEventListener("mousedown", h); }, []);

    if (!showBtn) return null;
    return (
        <div className={`relative ${isComment ? 'ml-2 flex-shrink-0' : ''}`} ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-${isComment ? '1' : '2'} rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ${isComment ? 'self-start mt-2' : ''}`} title="Options">
                <MdMoreVert className={`text-${isComment ? 'sm' : 'xl'}`} />
            </button>
            {isOpen && (
                <div className={`absolute ${isComment ? 'right-0 top-6 w-36' : 'right-0 mt-2 w-40'} bg-white border rounded-lg shadow-xl z-50 overflow-hidden`}>
                    <button onClick={handleDelete} className={`flex items-center w-full px-4 py-2 text-${isComment ? 'xs' : 'sm'} text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors`}>
                        <MdDeleteForever className={`mr-${isComment ? '1.5' : '2'} text-${isComment ? 'base' : 'lg'}`} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

const PostActions = ({ post, currentRollNo, onLikeToggle, openCommentsModal, openLikesModal }) => {
    const hasLiked = post.likes?.includes(currentRollNo);
    const likeCount = post.likes?.length || 0;
    const commentCount = post.comments?.length || 0;
    const handleLike = () => { if (!currentRollNo) { alert("Log in to like."); return; } onLikeToggle(post.id, hasLiked); };
    const likeBtn = `flex items-center justify-center w-1/2 gap-2 p-2 rounded-full transition-all duration-200 text-sm font-semibold ${hasLiked ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-100"}`;
    return (
        <div className="px-4">
            <div className="flex justify-between items-center text-xs text-gray-500 py-3 border-b border-gray-100">
                {likeCount > 0 && (
                    <button onClick={() => openLikesModal(post)} className="flex items-center gap-1 cursor-pointer font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        <MdThumbUp className="text-blue-500 w-4 h-4" /> <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
                    </button>
                )}
                {commentCount > 0 && (
                    <button onClick={() => openCommentsModal(post)} className="cursor-pointer font-medium text-gray-600 hover:text-gray-800 transition-colors">
                        <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
                    </button>
                )}
            </div>
            <div className="flex justify-around items-center py-2">
                <button onClick={handleLike} className={likeBtn}><MdThumbUp className="text-xl" /> <span>{hasLiked ? "Liked" : "Like"}</span></button>
                <button onClick={() => openCommentsModal(post)} className="flex items-center justify-center w-1/2 gap-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-sm font-semibold"><MdComment className="text-xl" /> <span>Comment</span></button>
            </div>
        </div>
    );
};

const CommentInput = ({ postId, userData, onCommentSubmit }) => {
    const [commentText, setText] = useState("");
    const rollNo = userData.roll_no;
    const isDisabled = !rollNo || commentText.trim().length === 0;
    const handleSubmit = (e) => { e.preventDefault(); if (isDisabled) return; onCommentSubmit(postId, { text: commentText.trim(), roll_no: rollNo, name: userData.name, last_name: userData.last_name, timestamp: Timestamp.now() }); setText(""); };
    const sendBtn = `p-1 rounded-full transition-colors ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:bg-blue-600 hover:text-white"}`;
    return (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-center mt-2 w-full">
                <div className="flex flex-grow items-center bg-gray-50 rounded-full pr-1 h-10 border border-gray-200">
                    <input type="text" placeholder={rollNo ? "Add a comment..." : "Log in to comment"} value={commentText} onChange={(e) => setText(e.target.value)}
                        className="flex-grow bg-transparent outline-none text-sm px-4 h-full placeholder-gray-500" disabled={!rollNo} />
                    <button type="submit" className={sendBtn} disabled={isDisabled}><MdSend className="text-xl" /></button>
                </div>
            </form>
        </div>
    );
};

const InteractionsModal = ({ interactionState, onClose, profileImageUrls, memberDetails, onDeleteComment, loggedInRollNo, isAdmin }) => {
    if (!interactionState?.post) return null;
    const { post, initialTab } = interactionState;
    const [activeTab, setActiveTab] = useState(initialTab || "likes");
    const comments = [...(post.comments || [])].sort((a, b) => (b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime()) - (a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(b.timestamp).getTime()));

    const renderLikes = () => (post.likes.length === 0 ? (<p className="text-center text-gray-500 mt-5 text-sm">Be the first to like this post!</p>) : (
        post.likes.map(rollNo => {
            const m = memberDetails[rollNo];
            const [n, l] = [m?.name || "Loading...", m?.last_name || ""];
            return (
                <div key={rollNo} className="flex items-start mt-1 p-2 rounded-lg transition-colors hover:bg-blue-50/50">
                    {ProfilePic(rollNo, n, l, profileImageUrls[rollNo])}
                    <p className={`font-semibold text-sm ${!m ? "text-gray-500 italic" : "text-gray-800"}`}>{!m ? `Fetching details...` : `${n} ${l}`}</p>
                </div>
            );
        })
    ));

    const renderComments = () => (comments.length === 0 ? (<p className="text-center text-gray-500 mt-10 text-sm">No comments yet. Start the conversation!</p>) : (
        comments.map((c, i) => (
            <div key={i} className="flex items-start justify-between">
                <div className="flex items-start flex-grow">
                    {ProfilePic(c.roll_no, c.name, c.last_name, profileImageUrls[c.roll_no])}
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
                        <p className="font-bold text-gray-900 text-xs mb-1">{(c.name || "Member") + " " + (c.last_name || "")}</p>
                        <p className="text-gray-700 whitespace-pre-wrap leading-snug">{c.text}</p>
                        {c.timestamp && (<div className="text-gray-500 text-[10px] mt-1 flex items-center"><MdOutlineAccessTime className="mr-0.5" /> {formatTs(c.timestamp)}</div>)}
                    </div>
                </div>
                <MenuDropdown postId={post.id} comment={c} isComment loggedInRollNo={loggedInRollNo} isAdmin={isAdmin} onDeleteComment={onDeleteComment} />
            </div>
        ))
    ));

    const [tabClass, activeClass, inactiveClass] = ["flex-1 text-center py-3 text-sm font-bold transition-colors", "text-blue-600 border-b-2 border-blue-600", "text-gray-500 hover:bg-gray-100 border-b-2 border-transparent"];

    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-80 z-50 flex items-end justify-center backdrop-blur-sm"><div className="bg-white w-full h-[90%] max-w-lg rounded-t-3xl shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">{activeTab === "comments" ? "Post Comments" : "Post Likes"}</h3>
                <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><MdClose className="text-xl" /></button>
            </div>
            <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab("likes")} className={`${tabClass} ${activeTab === "likes" ? activeClass : inactiveClass}`}>Likes ({post.likes.length})</button>
                <button onClick={() => setActiveTab("comments")} className={`${tabClass} ${activeTab === "comments" ? activeClass : inactiveClass}`}>Comments ({comments.length})</button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">{activeTab === "likes" ? renderLikes() : renderComments()}</div>
        </div></div>
    );
};


const Notify = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileImageUrls, setProfileImageUrls] = useState({});
    const [interactionState, setInteractionState] = useState(null);
    const [likedMemberDetails, setLikedMemberDetails] = useState({});
    const [zoomedImageLink, setZoomedImageLink] = useState(null); 
    
    const navigate = useNavigate();
    const userData = getLoggedUser();
    const { roll_no: loggedInRollNo, isSuperAdmin, isAdmin } = userData;

    const closeInteractionModal = useCallback(() => setInteractionState(null), []);
    const closeZoomModal = useCallback(() => setZoomedImageLink(null), []); 

    const updatePostState = useCallback((postId, updateFn) => {
        setPosts(c => c.map(p => { if (p.id === postId) { const u = updateFn(p); interactionState?.post.id === postId && setInteractionState(prev => ({ ...prev, post: u })); return u; } return p; }));
    }, [interactionState]);

    const fetchLikedDetails = useCallback(async (rolls) => {
        const uniqueRolls = [...new Set(rolls)].filter(Boolean); if (uniqueRolls.length === 0) return;
        const details = {};
        await Promise.all(uniqueRolls.reduce((acc, _, i, arr) => (i % 10 === 0 ? acc.concat([arr.slice(i, i + 10)]) : acc), []).map(async (chunk) => {
            const q = query(collection(db, "members"), where("roll_no", "in", chunk));
            const snap = await getDocs(q);
            snap.forEach((doc) => { const d = doc.data(); d.roll_no && (details[d.roll_no] = { name: d.name, last_name: d.last_name || "" }); });
        }));
        setLikedMemberDetails(p => ({ ...p, ...details }));
    }, []);

    const openModal = useCallback((post, tab) => {
        setInteractionState({ post, initialTab: tab });
        fetchLikedDetails([...(post.likes || []), ...(post.comments || []).map(c => c.roll_no)]);
    }, [fetchLikedDetails]);
    const openCommentsModal = (post) => openModal(post, "comments");
    const openLikesModal = (post) => openModal(post, "likes");

    const handleCommentSubmit = useCallback(async (postId, newComment) => {
        if (!loggedInRollNo) return; const ref = doc(db, "post", postId);
        try { await updateDoc(ref, { comments: arrayUnion(newComment) }); updatePostState(postId, p => ({ ...p, comments: [...(p.comments || []), newComment] })); if (!likedMemberDetails[newComment.roll_no]) fetchLikedDetails([newComment.roll_no]); } catch (err) { console.error("Comment error:", err); alert("Failed to submit comment."); }
    }, [loggedInRollNo, likedMemberDetails, fetchLikedDetails, updatePostState]);

    const handleDeleteComment = useCallback(async (postId, c) => {
        if (!window.confirm("Delete this comment?")) return; const ref = doc(db, "post", postId);
        try { await updateDoc(ref, { comments: arrayRemove(c) }); updatePostState(postId, p => ({ ...p, comments: (p.comments || []).filter(cmt => cmt.roll_no !== c.roll_no || cmt.text !== c.text || !cmt.timestamp.isEqual(c.timestamp)) })); } catch (err) { console.error("Comment delete error:", err); alert("Failed to delete comment."); }
    }, [updatePostState]);

    const handleLikeToggle = useCallback(async (postId, liked) => {
        if (!loggedInRollNo) return; const ref = doc(db, "post", postId); const action = liked ? arrayRemove(loggedInRollNo) : arrayUnion(loggedInRollNo);
        try { await updateDoc(ref, { likes: action }); updatePostState(postId, p => { const newLikes = liked ? (p.likes || []).filter(r => r !== loggedInRollNo) : [...(p.likes || []), loggedInRollNo]; !liked && fetchLikedDetails([loggedInRollNo]); return { ...p, likes: newLikes }; }); } catch (err) { console.error("Like error:", err); alert("Failed to update like status."); }
    }, [loggedInRollNo, fetchLikedDetails, updatePostState]);

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete this post?")) return;
        try { await deleteDoc(doc(db, "post", postId)); setPosts(c => c.filter(p => p.id !== postId)); interactionState?.post.id === postId && closeInteractionModal(); } catch (err) { console.error("Post delete error: ", err); alert("Failed to delete the post."); }
    };

    const getProfileUrl = useCallback(async (roll) => {
        if (profileImageUrls[roll] !== undefined) return;
        let url = null;
        for (const ext of IMAGE_EXTENSIONS) { try { if ((await fetch(`${GITHUB_BASE_URL}${roll}.${ext}`, { method: "HEAD" })).ok) { url = `${GITHUB_BASE_URL}${roll}.${ext}`; break; } } catch (e) {} }
        setProfileImageUrls(p => ({ ...p, [roll]: url }));
    }, [profileImageUrls]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const snap = await getDocs(query(collection(db, "post"), orderBy("upload_time", "desc")));
                const [list, toDelete, rolls, time] = [[], [], new Set(), new Date().getTime()];

                snap.docs.forEach(d => {
                    const data = { id: d.id, ...d.data(), likes: d.data().likes || [], comments: d.data().comments || [] };
                    const uploadTime = data.upload_time?.toDate ? data.upload_time.toDate().getTime() : new Date(data.upload_time).getTime();

                    (time - uploadTime >= TWENTY_FOUR_HOURS_IN_MS) ? toDelete.push(data.id) : (list.push(data), rolls.add(data.roll_number));
                });
                
                await Promise.all(Array.from(rolls).map(getProfileUrl));
                toDelete.length > 0 && await Promise.all(toDelete.map(id => deleteDoc(doc(db, "post", id))));
                setPosts(list);
            } catch (err) { setError("Failed to load posts."); console.error("Fetch error:", err); } finally { setLoading(false); }
        };
        fetchPosts();
    }, [getProfileUrl]);

    const handleImageClick = (link) => setZoomedImageLink(link); 

    const renderPost = (p) => {
        const [time, showDelete, url, hasImg] = [formatTs(p.upload_time), isSuperAdmin || p.roll_number === loggedInRollNo, profileImageUrls[p.roll_number], profileImageUrls[p.roll_number] !== null && profileImageUrls[p.roll_number] !== undefined];
        return (
            <div key={p.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mx-2 sm:mx-0">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        {hasImg ? (<img src={url} alt={`${p.name}'s profile`} className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/50 flex-shrink-0" />) : (<div className="w-11 h-11 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-lg flex-shrink-0">{p.name?.charAt(0) || "U"}</div>)}
                        <div>
                            <p className="text-sm font-bold text-gray-900 flex items-center">{p.name} {p.last_name} {p.roll_number === "ADMIN_ROLL" && <MdVerified className="text-blue-500 ml-1 text-xs" />}</p>
                            <p className="text-xs text-gray-500 flex items-center"><MdOutlineAccessTime className="inline-block mr-1 align-sub" /> {time}</p>
                        </div>
                    </div>
                    <MenuDropdown postId={p.id} showDeleteButton={showDelete} onDeletePost={handleDeletePost} />
                </div>
                {p.text_content && <div className="px-4 pb-2 text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{p.text_content}</div>}
                {p.image_link && 
                    <div className="w-full mt-2 mb-2 bg-gray-100 cursor-zoom-in" onClick={() => handleImageClick(p.image_link)}>
                        <img src={p.image_link} alt="Post" className="w-full h-auto object-cover max-h-[500px] border-t border-b border-gray-200" />
                    </div>
                }
                <PostActions post={p} currentRollNo={loggedInRollNo} onLikeToggle={handleLikeToggle} openCommentsModal={openCommentsModal} openLikesModal={openLikesModal} />
                <CommentInput postId={p.id} userData={userData} onCommentSubmit={handleCommentSubmit} />
            </div>
        );
    };

    const renderContent = () => {
        if (loading) return <Loader />;
        if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4"><p className="text-xl font-semibold text-red-600">{error}</p></div>;

        return posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 mt-12">
                <MdNotificationsNone className="text-8xl mb-4 text-gray-300" />
                <p className="text-xl font-bold text-gray-700">No Recent Activity</p>
                <p className="text-sm text-gray-500 mb-6">Posts are removed after 24 hours.</p>
                <button onClick={() => navigate("/createpost")} className="px-6 py-3 flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] bg-blue-600 text-white font-bold">
                    <MdAddCircle className="text-xl" /> Create New Post
                </button>
            </div>
        ) : (<div className="flex flex-col gap-5 py-1 font-[Inter,sans-serif]">{posts.map(renderPost)}</div>);
    };

    return (
        <>
            <div className="p-0 max-w-xl mx-auto py-14 bg-gray-50 min-h-screen shadow-2xl">{renderContent()}</div>
            {interactionState && (
                <InteractionsModal
                    interactionState={interactionState}
                    onClose={closeInteractionModal}
                    profileImageUrls={profileImageUrls}
                    memberDetails={likedMemberDetails}
                    onDeleteComment={handleDeleteComment}
                    loggedInRollNo={loggedInRollNo}
                    isAdmin={isAdmin}
                />
            )}
            {zoomedImageLink && <ZoomModal imageUrl={zoomedImageLink} onClose={closeZoomModal} />}
        </>
    );
};

export default Notify;