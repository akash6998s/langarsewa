import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Topbar from "./Topbar";
import Loader from "./Loader";
import { theme } from "../theme";
import FilterListIcon from "@mui/icons-material/FilterList";

const Gallery = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "images"));
        const imgs = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        sortAndSetImages(imgs, sortOrder);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    Promise.all([
      fetchImages(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => setIsLoading(false));
  }, [sortOrder]);

  const sortAndSetImages = (imgs, order) => {
    const sortedImgs = imgs.sort((a, b) =>
      order === "asc"
        ? new Date(a.uploadedAt) - new Date(b.uploadedAt)
        : new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    setUploadedData(sortedImgs);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSelect = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedImages.length} image(s)?`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await Promise.all(
        selectedImages.map((id) => deleteDoc(doc(db, "images", id)))
      );
      setUploadedData((prev) =>
        prev.filter((img) => !selectedImages.includes(img.id))
      );
      setSelectedImages([]);
      setSelectionMode(false);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleBackButton = (event) => {
      if (zoomImage) {
        event.preventDefault();
        setZoomImage(null);
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [zoomImage]);

  useEffect(() => {
    if (zoomImage) {
      window.history.pushState({ zoom: true }, "");
    }
  }, [zoomImage]);

  return (
    <>
      {(isLoading || deleting) && <Loader />}
      <Topbar />

      <div
        className="flex flex-col py-12 font-[Inter,sans-serif]"
        style={{
          background: theme.colors.background,
          fontFamily: theme.fonts.body,
        }}
      >
        <div className="max-w-md mx-auto w-full">
          {/* Action Bar */}
          <div className="flex justify-between items-center px-4 py-2">
            {/* Filter Icon */}
            <button
              onClick={toggleSortOrder}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              title={`Sort ${sortOrder === "asc" ? "Oldest First" : "Newest First"}`}
            >
              <FilterListIcon />
            </button>

            {!selectionMode ? (
              <button
                onClick={() => setSelectionMode(true)}
                className="px-4 py-2 rounded-full font-semibold text-white shadow-sm"
                style={{ background: theme.colors.primary }}
                disabled={deleting}
              >
                Select
              </button>
            ) : (
              <div className="flex gap-2 w-full justify-between">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedImages.length === 0 || deleting}
                  className={`flex-1 px-4 py-2 rounded-full font-semibold text-white shadow-sm transition ${
                    selectedImages.length === 0
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-105"
                  }`}
                  style={{ background: theme.colors.danger }}
                >
                  Delete ({selectedImages.length})
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedImages([]);
                  }}
                  className="flex-1 px-4 py-2 rounded-full font-semibold text-white shadow-sm hover:scale-105 transition"
                  style={{ background: theme.colors.neutralDark }}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          {uploadedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 p-2 mt-2">
              {uploadedData.map((img) => (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden transition-all shadow-md ${
                    selectedImages.includes(img.id)
                      ? "ring-4 ring-blue-500"
                      : "hover:scale-105"
                  }`}
                >
                  <img
                    src={img.thumb}
                    alt="uploaded"
                    className="w-full h-40 object-cover rounded-xl cursor-pointer"
                    onClick={() => {
                      if (selectionMode) handleSelect(img.id);
                      else setZoomImage(img.url);
                    }}
                  />
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(img.id)}
                      onChange={() => handleSelect(img.id)}
                      className="absolute top-2 left-2 w-5 h-5 accent-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-10">
              No images uploaded yet.
            </p>
          )}

          {/* Zoom Modal */}
          {zoomImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[10000] p-2"
              onClick={() => setZoomImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white text-3xl font-bold rounded-full w-12 h-12 flex items-center justify-center bg-gray-900 bg-opacity-80 hover:bg-opacity-100 transition"
              >
                ✕
              </button>
              <img
                src={zoomImage}
                alt="Zoomed"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Gallery;
