import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Loader from "./Loader";
import { theme } from "../theme";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Helper function to calculate the distance between two touch points for pinch detection
const getDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const Gallery = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isAdmin, setIsAdmin] = useState(false);

  // Touch slide states (for image swiping)
  const [initialTouchX, setInitialTouchX] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  // Zoom and Pan states
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [initialTouchState, setInitialTouchState] = useState(null);

  const zoomImage = zoomIndex !== null ? uploadedData[zoomIndex]?.url : null;

  // Reset zoom/pan when a new image is loaded or modal is closed
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setInitialTouchState(null);
  }, [zoomIndex]);

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

      const now = new Date();
      const timestamp = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}-${now.getSeconds()}`;

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
        const response = await fetch(zoomImage);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: blob.type });

        await navigator.share({
          files: [file],
          title: "Image from Gallery",
          text: "Check out this image from the gallery!",
        });
      } catch (error) {
        console.error("Share error:", error);
        alert("Share functionality failed. Please try again.");
      }
    } else {
      alert("Share functionality is not supported in this browser.");
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
    if (scale > 1) return;
    setInitialTouchX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (scale > 1) return;
    const currentTouchX = e.targetTouches[0].clientX;
    setSlideOffset(currentTouchX - initialTouchX);
  };

  const handleTouchEnd = () => {
    if (scale > 1) return;
    if (slideOffset > 50) showPrevImage();
    else if (slideOffset < -50) showNextImage();
    setSlideOffset(0);
  };

  const handleZoomTouchStart = (e) => {
    if (e.touches.length === 2) {
      setInitialTouchState({
        distance: getDistance(e.touches),
        scale: scale,
        translateX: translateX,
        translateY: translateY,
      });
    } else if (e.touches.length === 1 && scale > 1) {
      setInitialTouchState({
        scale: scale,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        translateX: translateX,
        translateY: translateY,
      });
    }
  };

  const handleZoomTouchMove = (e) => {
    if (!initialTouchState) return;
    if (e.touches.length === 2 || (e.touches.length === 1 && scale > 1)) {
      e.preventDefault();
    }

    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      const newScale = initialTouchState.scale * (currentDistance / initialTouchState.distance);
      setScale(Math.max(1, Math.min(3, newScale)));
    } else if (e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - initialTouchState.startX;
      const deltaY = e.touches[0].clientY - initialTouchState.startY;
      const maxPan = (scale - 1) * 150;
      setTranslateX(Math.min(maxPan, Math.max(-maxPan, initialTouchState.translateX + deltaX)));
      setTranslateY(Math.min(maxPan, Math.max(-maxPan, initialTouchState.translateY + deltaY)));
    }
  };

  const handleZoomTouchEnd = () => {
    setInitialTouchState(null);
    if (scale < 1.1) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }
  };

  return (
    <>
      {(isLoading || deleting) && <Loader />}

      <div
        className="flex flex-col pb-24 font-[Inter,sans-serif] min-h-screen"
        style={{ background: theme.colors.background }}
      >
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-[100] w-full bg-white shadow-sm border-b border-gray-200">
          <div className="pb-4 text-center">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              Photo Gallery
            </h1>
          </div>

          {/* Action Bar inside sticky container */}
          <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50">
            <button
              onClick={toggleSortOrder}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              title={`Sort ${sortOrder === "asc" ? "Oldest First" : "Newest First"}`}
            >
              <FilterListIcon />
            </button>

            {isAdmin && (
              <div className="flex gap-2">
                {!selectionMode ? (
                  <button
                    onClick={() => setSelectionMode(true)}
                    className="px-6 py-2 rounded-full font-medium text-white shadow-sm transition active:scale-95"
                    style={{ background: theme.colors.primary }}
                    disabled={deleting}
                  >
                    Select
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedImages.length === 0 || deleting}
                      className={`px-4 py-2 rounded-full font-medium text-white shadow-sm transition ${
                        selectedImages.length === 0 ? "opacity-50" : "hover:bg-red-700"
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
                      className="px-4 py-2 rounded-full font-medium text-white bg-gray-500 shadow-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1">
          {uploadedData.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 p-1 mt-2">
              {uploadedData.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative overflow-hidden rounded-md transition-all ${
                    selectedImages.includes(img.id)
                      ? "ring-4 ring-blue-500 z-10 scale-[0.98]"
                      : "hover:opacity-90"
                  }`}
                >
                  <img
                    src={img.thumb}
                    alt="uploaded"
                    className="w-full h-28 sm:h-32 md:h-36 object-cover cursor-pointer"
                    onClick={() => {
                      if (selectionMode) handleSelect(img.id);
                      else setZoomIndex(index);
                    }}
                  />
                  {selectionMode && isAdmin && (
                    <div className="absolute top-2 left-2 pointer-events-none">
                       <input
                        type="checkbox"
                        checked={selectedImages.includes(img.id)}
                        readOnly
                        className="w-5 h-5 accent-blue-600 rounded shadow"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <p className="text-center text-gray-500 mt-20">
                No images uploaded yet.
              </p>
            )
          )}
        </div>

        {/* Zoom Modal */}
        {zoomImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[10000] p-2 touch-none"
            onTouchStart={handleZoomTouchStart}
            onTouchMove={handleZoomTouchMove}
            onTouchEnd={handleZoomTouchEnd}
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-3 z-[10001]">
                <button onClick={handleDownload} className="p-2 bg-white rounded-full text-gray-800 shadow-lg"><FileDownloadOutlinedIcon /></button>
                <button onClick={handleShare} className="p-2 bg-white rounded-full text-gray-800 shadow-lg"><ShareOutlinedIcon /></button>
              </div>
              <div className="absolute top-4 right-4 z-[10001]">
                <button onClick={() => setZoomIndex(null)} className="p-2 bg-white rounded-full text-gray-800 shadow-lg"><CloseIcon /></button>
              </div>

              {scale === 1 && (
                <>
                  <button onClick={showPrevImage} className="absolute left-4 text-white bg-black/50 p-2 rounded-full hidden md:block z-[10001]"><ArrowBackIosNewIcon /></button>
                  <button onClick={showNextImage} className="absolute right-4 text-white bg-black/50 p-2 rounded-full hidden md:block z-[10001]"><ArrowForwardIosIcon /></button>
                </>
              )}

              <img
                key={zoomIndex}
                src={zoomImage}
                alt="Zoomed"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                  transition: initialTouchState ? 'none' : 'transform 0.3s ease-out',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Gallery;