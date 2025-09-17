import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import Topbar from "./Topbar";
import { theme } from "../theme"; // Corrected import path

const isDataFilled = (data) => {
  if (typeof data === "string") {
    return data.trim() !== "";
  }
  return data !== null && data !== undefined;
};

const checkPhotoExists = async (rollNo) => {
  const extensions = ["png", "jpg", "jpeg"];
  for (const ext of extensions) {
    const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${rollNo}.${ext}`;
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error(
        `Failed to check for photo with extension .${ext} for roll no. ${rollNo}:`,
        error
      );
    }
  }
  return false;
};

const UpdatedList = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoStatus, setPhotoStatus] = useState({});

  useEffect(() => {
    const loadData = new Promise((resolve, reject) => {
      try {
        const storedData = localStorage.getItem("allMembers");
        if (storedData) {
          const membersList = JSON.parse(storedData);
          setMembers(membersList);

          const statusPromises = membersList.map(async (member) => {
            const hasPhoto = await checkPhotoExists(member.roll_no);
            return { rollNo: member.roll_no, status: hasPhoto };
          });

          Promise.all(statusPromises)
            .then((statuses) => {
              const newPhotoStatus = statuses.reduce((acc, current) => {
                acc[current.rollNo] = current.status;
                return acc;
              }, {});
              setPhotoStatus(newPhotoStatus);
              resolve();
            })
            .catch((err) => {
              console.error("Error checking photos:", err);
              resolve();
            });
        } else {
          setError("No data found in localStorage with key 'allMembers'.");
          reject();
        }
      } catch (err) {
        console.error("Failed to parse data from localStorage:", err);
        setError(
          "Failed to load data. The data in localStorage may be corrupted."
        );
        reject();
      }
    });

    const delay = new Promise((resolve) => setTimeout(resolve, 2000));

    Promise.all([loadData, delay]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const isRowHighlighted = (member) => {
    return (
      !isDataFilled(member.phone_no) ||
      !isDataFilled(member.email) ||
      !isDataFilled(member.address) ||
      !photoStatus[member.roll_no]
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: theme.colors.background }}
      >
        <p
          className="text-lg font-semibold"
          style={{ color: theme.colors.danger }}
        >
          {error}
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: theme.colors.background }}
      >
        <p className="text-lg" style={{ color: theme.colors.neutral }}>
          No members found. The list is empty.
        </p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div
        className="pb-24 pt-16 px-4 sm:px-6 lg:px-8 font-[Inter,sans-serif]"
        style={{ background: theme.colors.background }}
      >
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-6"
          style={{ color: theme.colors.neutralDark }}
        >
          Member Details Summary
        </h2>
        <div
          className="rounded-lg shadow-lg overflow-hidden"
          style={{ background: theme.colors.white }}
        >
          <table className="min-w-full hidden sm:table">
            <thead
              style={{ background: theme.colors.lightGray }}
            >
              <tr>
                <th
                  className="py-3 px-4 text-left text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Roll No.
                </th>
                <th
                  className="py-3 px-4 text-left text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Full Name
                </th>
                <th
                  className="py-3 px-4 text-center text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Phone No.
                </th>
                <th
                  className="py-3 px-4 text-center text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Email
                </th>
                <th
                  className="py-3 px-4 text-center text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Address
                </th>
                <th
                  className="py-3 px-4 text-center text-sm font-semibold"
                  style={{ color: theme.colors.neutral }}
                >
                  Photo
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors duration-200"
                  style={{
                    background: isRowHighlighted(member)
                      ? theme.colors.dangerLight
                      : theme.colors.white,
                    color: theme.colors.neutralDark,
                  }}
                >
                  <td className="py-3 px-4 text-sm">
                    {member.roll_no}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {isDataFilled(member.name) ? member.name : ""}
                    {isDataFilled(member.last_name)
                      ? ` ${member.last_name}`
                      : ""}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {isDataFilled(member.phone_no) ? "✅" : "❌"}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {isDataFilled(member.email) ? "✅" : "❌"}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {isDataFilled(member.address) ? "✅" : "❌"}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {photoStatus[member.roll_no] ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sm:hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 mb-4 rounded-lg shadow-sm transition-colors duration-200"
                style={{
                  background: isRowHighlighted(member)
                    ? theme.colors.dangerLight
                    : theme.colors.white,
                  border: isRowHighlighted(member)
                    ? `1px solid ${theme.colors.danger}`
                    : `1px solid ${theme.colors.lightGray}`,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="font-bold text-lg"
                    style={{ color: theme.colors.neutralDark }}
                  >
                    Roll No. {member.roll_no}
                  </span>
                  <span style={{ color: theme.colors.neutral }}>
                    {isDataFilled(member.name) ? member.name : ""}
                    {isDataFilled(member.last_name)
                      ? ` ${member.last_name}`
                      : ""}
                  </span>
                </div>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between items-center">
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.neutral }}
                    >
                      Phone No.
                    </span>
                    <span>{isDataFilled(member.phone_no) ? "✅" : "❌"}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.neutral }}
                    >
                      Email
                    </span>
                    <span>{isDataFilled(member.email) ? "✅" : "❌"}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.neutral }}
                    >
                      Address
                    </span>
                    <span>{isDataFilled(member.address) ? "✅" : "❌"}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.neutral }}
                    >
                      Photo
                    </span>
                    <span>{photoStatus[member.roll_no] ? "✅" : "❌"}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatedList;