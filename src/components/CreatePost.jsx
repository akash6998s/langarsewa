import React, { useState } from "react";
import axios from "axios";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";
import Loader from "./Loader";

const IMGBB_API_KEY = "3d4ec45255aa2a6c2896e919e5ddfb4c";
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

function CreatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const savePostToFirebase = async (postData) => {
    try {
      await addDoc(collection(db, "post"), postData);
      console.log("Post saved to Firestore!");
    } catch (e) {
      console.error("Error adding document: ", e);
      setMessage("Error saving post to database. Please check console.");
    }
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      const response = await axios.post(
        `${IMGBB_API_URL}?key=${IMGBB_API_KEY}&expiration=86400`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      console.error("ImgBB upload failed:", error.response || error);
      throw new Error("Image upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!imageFile && !text) {
      setMessage("Please select an image and/or enter text to upload.");
      setLoading(false);
      return;
    }

    try {
      let image_link = null;
      let text_content = null;

      if (imageFile) {
        image_link = await uploadImage(imageFile);
      }

      if (text) {
        text_content = text;
      }

      const memberData = JSON.parse(localStorage.getItem("loggedInMember"));
      const roll_number = memberData ? memberData.roll_no : "unknown";
      const name = memberData ? memberData.name : "unknown";
      const last_name = memberData ? memberData.last_name : "unknown";

      const postData = {
        upload_time: serverTimestamp(),
        roll_number,
        name,
        last_name,
        image_link,
        text_content,
        // 👇 ADDED: Initialize likes and comments as empty arrays
        likes: [],
        comments: [],
      };

      await savePostToFirebase(postData);

      setMessage("✅ Post uploaded successfully!");
      setText("");
      setImageFile(null);
      setPreviewImage(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>

      <div className="p-4 max-w-md mx-auto py-12">
        <div
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
          style={{ border: `1px solid ${theme.colors.primaryLight}` }}
        >
          {/* Header */}
          <h2
            className="text-xl font-bold text-center"
            style={{ color: theme.colors.primary }}
          >
            Create a Post
          </h2>

          {/* Textarea */}
          <textarea
            rows="4"
            value={text}
            onChange={handleTextChange}
            placeholder="What's on your mind?"
            className="w-full p-3 rounded-xl border text-sm focus:ring-2 focus:outline-none resize-none"
            style={{
              borderColor: theme.colors.primaryLight,
              backgroundColor: theme.colors.neutralLight,
              color: theme.colors.neutralDark,
            }}
          />

          {/* Image Upload */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="image-upload"
              className="cursor-pointer py-2 px-4 rounded-xl text-center text-sm font-medium border transition hover:bg-gray-100"
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              📷 Choose an image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Preview Image */}
            {previewImage && (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="rounded-xl w-full max-h-60 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || (!imageFile && !text)}
            className="w-full py-2 rounded-xl font-semibold transition"
            style={{
              backgroundColor: loading
                ? theme.colors.secondary
                : theme.colors.primary,
              color: theme.colors.neutralLight,
              opacity: loading || (!imageFile && !text) ? 0.6 : 1,
            }}
          >
            {loading ? "Uploading..." : "Post"}
          </button>

          {/* Message */}
          {message && (
            <p
              className="text-center text-sm font-medium mt-2"
              style={{
                color: message.includes("successfully")
                  ? theme.colors.success
                  : theme.colors.danger,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default CreatePost;