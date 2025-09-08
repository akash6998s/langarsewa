import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { theme } from "../theme";
import Loader from "./Loader"; // Import the Loader component

const UploadImages = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
      setImages([]);
    }
  };

  return (
    <>
      {uploading && <Loader />}
      <div
        className="flex items-center justify-center pt-12"
        style={{
          background: theme.colors.background,
          fontFamily: theme.fonts.body,
        }}
      >
        <div
          className="w-full max-w-xl shadow-2xl rounded-2xl p-8 border"
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

          <label
            className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition"
            style={{
              borderColor: theme.colors.primaryLight,
              color: theme.colors.primary,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 mb-3"
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
            <span className="font-medium">Click to select images</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

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
    </>
  );
};

export default UploadImages;