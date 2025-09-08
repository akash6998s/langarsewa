import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { theme } from "../theme";
import Loader from "./Loader";

const UploadImages = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const IMGBB_API_KEY = "e148d01d1cec46756d464136ea36ca3e"; // 🔑 Replace with your key

  const handleFileChange = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert("Please select images first!");
      return;
    }

    setUploading(true);

    const uploadPromises = images.map((img) => {
      const formData = new FormData();
      formData.append("image", img);

      return fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const imageInfo = {
              url: data.data.url,
              display_url: data.data.display_url,
              thumb: data.data.url,
              deleteUrl: data.data.delete_url,
              uploadedAt: new Date().toISOString(),
            };
            return addDoc(collection(db, "images"), imageInfo);
          } else {
            console.error("ImgBB Error:", data);
            return Promise.reject("ImgBB upload failed");
          }
        });
    });

    try {
      await Promise.all(uploadPromises);
      alert("Images uploaded successfully!");
      setImages([]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {uploading && <Loader />}

      <div
        className="pt-24 p-6 min-h-screen"
        style={{
          background: theme.colors.background,
          fontFamily: theme.fonts.body,
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Top action bar */}
          <div className="flex justify-between items-center mb-6">
            {/* Left side: Filter icon */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
              style={{ background: theme.colors.neutralLight, color: theme.colors.primary }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-7 8v5l-4 2v-7L3 6V4z" />
              </svg>
              Filter
            </button>

            {/* Right side: Select, Delete, Cancel */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectionMode(!selectionMode)}
                className="px-4 py-2 rounded-lg shadow-sm font-semibold transition hover:shadow-md"
                style={{
                  background: theme.colors.primary,
                  color: theme.colors.neutralLight,
                }}
              >
                {selectionMode ? "Cancel" : "Select"}
              </button>

              {selectionMode && (
                <button
                  className="px-4 py-2 rounded-lg shadow-sm font-semibold transition hover:shadow-md"
                  style={{
                    background: theme.colors.secondary,
                    color: theme.colors.neutralLight,
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Upload Card */}
          <div
            className="w-full shadow-2xl rounded-2xl p-8 border"
            style={{
              background: theme.colors.neutralLight,
              borderColor: theme.colors.tertiaryLight,
            }}
          >
            <h2
              className="text-2xl font-extrabold mb-6 text-center"
              style={{
                color: theme.colors.neutralDark,
                fontFamily: theme.fonts.heading,
              }}
            >
              Upload Your Images
            </h2>

            {/* Custom select button */}
            <label
              className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-primaryLight"
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mb-3"
                style={{ color: theme.colors.secondary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0 0l-3-3m3 3l3-3M12 3v9"
                />
              </svg>
              <span className="font-medium text-lg">Click to select images</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Image previews */}
            {images.length > 0 && (
              <div
                className="mt-6 max-h-40 overflow-x-auto overflow-y-hidden whitespace-nowrap border rounded-lg p-3 flex gap-3"
                style={{
                  borderColor: theme.colors.tertiaryLight,
                }}
              >
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-28 flex-shrink-0 rounded-lg overflow-hidden border shadow-sm"
                    style={{
                      borderColor: theme.colors.secondaryLight,
                      background: theme.colors.tertiaryLight,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || images.length === 0}
              className="mt-6 w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: theme.colors.primary,
                fontFamily: theme.fonts.body,
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadImages;
