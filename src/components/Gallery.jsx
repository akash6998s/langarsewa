import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Topbar from "./Topbar";
import Loader from "./Loader";
import { theme } from "../theme";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Gallery = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isAdmin, setIsAdmin] = useState(false);

  // States for enhanced touch-based sliding
  const [initialTouchX, setInitialTouchX] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  const zoomImage = zoomIndex !== null ? uploadedData[zoomIndex]?.url : null;

  useEffect(() => {
    const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
    if (loggedInMember?.isAdmin) setIsAdmin(true);
  }, []);

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
      new Promise((resolve) => setTimeout(resolve, 2000)),
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

  const handleDownload = async () => {
    if (!zoomImage) return;
    try {
      const response = await fetch(zoomImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Create a timestamp for the filename
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${day}-${month}-${year}-${seconds}`;
      
      // Set the filename
      link.setAttribute("download", `image-${timestamp}.jpg`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && zoomImage) {
      try {
        await navigator.share({
          title: "Image from Gallery",
          text: "Check out this image from the gallery!",
          url: zoomImage,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      alert("Share functionality not supported in this browser.");
    }
  };

  const showPrevImage = useCallback(() => {
    setZoomIndex((prev) => (prev > 0 ? prev - 1 : uploadedData.length - 1));
  }, [uploadedData.length]);

  const showNextImage = useCallback(() => {
    setZoomIndex((prev) => (prev < uploadedData.length - 1 ? prev + 1 : 0));
  }, [uploadedData.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!zoomImage) return;
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
      if (e.key === "Escape") setZoomIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomImage, showPrevImage, showNextImage]);

  const handleTouchStart = (e) => {
    setInitialTouchX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const currentTouchX = e.targetTouches[0].clientX;
    setSlideOffset(currentTouchX - initialTouchX);
  };

  const handleTouchEnd = () => {
    if (slideOffset > 50) {
      showPrevImage();
    } else if (slideOffset < -50) {
      showNextImage();
    }
    setSlideOffset(0);
  };

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
            <button
              onClick={toggleSortOrder}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              title={`Sort ${sortOrder === "asc" ? "Oldest First" : "Newest First"}`}
            >
              <FilterListIcon />
            </button>
            {isAdmin && (
              <>
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
              </>
            )}
          </div>

          {/* Gallery Grid */}
          {uploadedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 p-2 mt-2">
              {uploadedData.map((img, index) => (
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
                      else setZoomIndex(index);
                    }}
                  />
                  {selectionMode && isAdmin && (
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Left (Download & Share) */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform"
                    title="Download"
                  >
                    <FileDownloadOutlinedIcon />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform"
                    title="Share"
                  >
                    <ShareOutlinedIcon />
                  </button>
                </div>

                {/* Right (Close) */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setZoomIndex(null)}
                    className="p-2 bg-white rounded-full text-gray-800 shadow-lg hover:scale-110 transition-transform"
                    title="Close"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Navigation Arrows (visible on desktop) */}
                <button
                  onClick={showPrevImage}
                  className="absolute left-4 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-70 hidden md:block"
                >
                  <ArrowBackIosNewIcon />
                </button>
                <button
                  onClick={showNextImage}
                  className="absolute right-4 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-70 hidden md:block"
                >
                  <ArrowForwardIosIcon />
                </button>

                {/* The Image with zoom and touch-only slide */}
                <img
                  key={zoomIndex}
                  src={zoomImage}
                  alt="Zoomed"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-in-out cursor-zoom-in"
                  style={{ transform: `translateX(${slideOffset}px)` }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents click from triggering slide
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Gallery;