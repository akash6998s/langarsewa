import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";

// MUI Icons
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";

const collections = [
  "expenses",
  "members",
  "images",
  "users",
  "archivedDonations",
  "working",
];

const DownloadBackup = () => {
  const [downloading, setDownloading] = useState(false);
  const [lastDownload, setLastDownload] = useState(null);
  const [error, setError] = useState(null);

  const getTimestamp = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
  };

  const downloadCollection = async (collectionName) => {
    setError(null);
    try {
      setDownloading(true);
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (data.length === 0) {
        alert(`No data found in collection: ${collectionName}`);
        setDownloading(false);
        return;
      }

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const timestamp = getTimestamp();
      const link = document.createElement("a");
      link.href = url;
      link.download = `${collectionName}-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      setLastDownload(new Date());
    } catch (err) {
      console.error("Error downloading collection:", err);
      setError(`Failed to download ${collectionName}: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllCollections = async () => {
    setError(null);
    setDownloading(true);
    try {
      for (const col of collections) {
        await downloadCollection(col);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setLastDownload(new Date());
    } catch (err) {
      console.error("Error downloading all collections:", err);
      setError(`Failed to download all collections: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center p-6"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div
        className="w-full max-w-4xl p-5 rounded-3xl shadow-2xl flex flex-col items-center animate-fade-in"
        style={{
          backgroundColor: theme.colors.neutralLight,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight"
          style={{ color: theme.colors.primary }}
        >
          Database Backup
        </h1>

        {/* Status Messages */}
        {downloading && (
          <div
            className="flex items-center justify-center w-full mb-4 gap-3 text-lg font-medium p-3 rounded-lg"
            style={{
              backgroundColor: theme.colors.secondaryLight,
              color: theme.colors.primary,
            }}
          >
            <CloudDownloadIcon className="animate-bounce" /> Downloading...
            Please wait.
          </div>
        )}
        {error && (
          <div
            className="flex items-center justify-center w-full mb-4 gap-3 text-lg font-medium p-3 rounded-lg"
            style={{
              backgroundColor: theme.colors.dangerLight,
              color: theme.colors.danger,
            }}
          >
            <ErrorOutlineIcon /> {error}
          </div>
        )}
        {lastDownload && !downloading && !error && (
          <div
            className="flex items-center justify-center w-full mb-4 gap-3 text-lg font-medium p-3 rounded-lg"
            style={{
              backgroundColor: theme.colors.successLight,
              color: theme.colors.success,
            }}
          >
            <CheckCircleOutlineIcon /> Last download successful:{" "}
            {lastDownload.toLocaleString()}
          </div>
        )}

        {/* Buttons for individual collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {collections.map((col) => (
            <button
              key={col}
              onClick={() => downloadCollection(col)}
              disabled={downloading}
              className="flex items-start justify-start gap-3 px-6 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 ease-in-out transform
                         hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-1 min-w-0"
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.neutralLight,
                borderColor: theme.colors.secondary,
                "--tw-ring-color": theme.colors.secondaryLight,
              }}
            >
              <FolderOpenIcon /> {col}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative flex py-5 items-center w-full">
          <div
            className="flex-grow border-t"
            style={{ borderColor: theme.colors.border }}
          ></div>
          <span
            className="flex-shrink mx-4 text-lg font-medium"
            style={{ color: theme.colors.textSecondary }}
          >
            OR
          </span>
          <div
            className="flex-grow border-t"
            style={{ borderColor: theme.colors.border }}
          ></div>
        </div>

        {/* Download All */}
        <div>
          <button
            onClick={downloadAllCollections}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ease-in-out transform
               hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{
              backgroundColor: theme.colors.success,
              color: theme.colors.neutralLight,
              borderColor: theme.colors.success,
              "--tw-ring-color": theme.colors.successLight,
            }}
          >
            Download All Database
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadBackup;
