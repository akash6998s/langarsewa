import { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { theme } from "../theme";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generates years from 2025 to 2035
const years = Array.from({ length: 11 }, (_, i) => 2025 + i);

const dates = Array.from({ length: 31 }, (_, i) => i + 1);

function ManageAttendance() {
  const today = new Date();
  const [tab, setTab] = useState("add");
  const [selectedMonth, setSelectedMonth] = useState(months[today.getMonth()]);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  // Set initial selected year to 2025 if today's year is outside the new range
  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear() >= 2025 && today.getFullYear() <= 2035
      ? today.getFullYear()
      : 2025 // Default to 2025 if current year is not in the new range
  );
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showPopupRoll, setShowPopupRoll] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const API_URL = "https://langar-backend.onrender.com/api";

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      showPopup("Failed to load members.", err); // Changed err to "error" as popup expects string type
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedRolls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRolls.length === 0) {
      showPopup("Please select at least one roll number.", "error");
      return;
    }

    const payload = {
      Year: selectedYear.toString(),
      Month: selectedMonth,
      Date: selectedDate.toString(),
      RollNumber: selectedRolls,
    };

    const apiUrl =
      tab === "add"
        ? `${API_URL}/attendance/mark-attendance`
        : `${API_URL}/attendance/delete-attendance`;

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showPopup(
          tab === "add"
            ? "Attendance successfully added!"
            : "Attendance successfully deleted!",
          "success"
        );
        setSelectedRolls([]);
      } else {
        const errorData = await response.text();
        showPopup(errorData || "Something went wrong.", "error");
      }
    } catch {
      showPopup("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      className="font-serif pb-20"
      style={{ color: theme.colors.neutralDark }}
    >
      <div className="mx-auto px-4 pt-4 max-w-4xl">
        <div className="flex justify-center">
          <h1
            className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-wider uppercase drop-shadow-lg relative inline-block"
            style={{ color: theme.colors.primary }}
          >
            Manage Attendance
            <span
              className="absolute left-1/2 -bottom-2 w-1/2 h-1 rounded-full"
              style={{
                transform: "translateX(-50%)",
                background: `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
              }}
            />
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleTabChange("add")}
            className={`px-8 py-3 rounded-l-full text-lg shadow-md ${
              tab === "add" ? "font-semibold" : ""
            }`}
            style={{
              background:
                tab === "add"
                  ? `linear-gradient(to right, ${theme.colors.success}, ${theme.colors.success})`
                  : theme.colors.neutralLight,
              color: tab === "add" ? "#ffffff" : theme.colors.primary,
              borderColor: theme.colors.primaryLight,
            }}
          >
            Add Attendance
          </button>
          <button
            onClick={() => handleTabChange("delete")}
            className={`px-8 py-3 rounded-r-full text-lg shadow-md ${
              tab === "delete" ? "font-semibold" : ""
            }`}
            style={{
              background:
                tab === "delete"
                  ? `linear-gradient(to right, ${theme.colors.danger}, ${theme.colors.danger})`
                  : theme.colors.neutralLight,
              color: tab === "delete" ? "#ffffff" : theme.colors.primary,
              borderColor: theme.colors.primaryLight,
            }}
          >
            Delete Attendance
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl shadow-xl p-8 space-y-6"
          style={{
            backgroundColor: theme.colors.neutralLight,
          }}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPopupRoll(true)}
              className="text-white px-8 py-3 rounded-xl shadow-md"
              style={{
                background: `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
              }}
            >
              Select Roll Number(s)
            </button>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white text-xl font-semibold shadow-lg"
              style={{
                backgroundColor:
                  tab === "add" ? theme.colors.success : theme.colors.danger,
              }}
            >
              {tab === "add" ? "Submit Attendance" : "Delete Attendance"}
            </button>
          </div>
        </form>
      </div>

      {/* Roll Number Popup */}
      {showPopupRoll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: theme.colors.primaryLight,
            opacity: 0.98,
          }}
        >
          <div
            className="w-[95%] max-w-lg rounded-3xl border px-4 pt-2 pb-12 shadow-2xl max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primary,
              color: theme.colors.neutralDark,
            }}
          >
            {/* Sticky Header */}
            <div
              className="sticky py-4 top-0 z-10 flex justify-between items-center px-1"
              style={{
                backgroundColor: theme.colors.neutralLight,
              }}
            >
              <h2
                className="font-bold text-xl"
                style={{ color: theme.colors.primary }}
              >
                Select Roll Numbers
              </h2>

              <button
                onClick={() => setShowPopupRoll(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
                style={{
                  backgroundColor: theme.colors.danger,
                }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Roll Grid */}
            <div className="overflow-y-auto px-1" style={{ maxHeight: "70vh" }}>
              <div className="mb-6 grid grid-cols-5 gap-4 pt-2">
                {members.length > 0 ? (
                  members.map((member) => {
                    const roll = String(member.RollNumber);
                    const isSelected = selectedRolls.includes(roll);

                    return (
                      <button
                        key={roll}
                        onClick={() => toggleRoll(roll)}
                        className="flex items-center justify-center rounded-xl border p-3 text-lg font-bold shadow-sm transition-all duration-200"
                        style={{
                          background: isSelected
                            ? `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`
                            : theme.colors.secondaryLight,
                          color: isSelected
                            ? theme.colors.neutralLight
                            : theme.colors.primary,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.secondary,
                        }}
                      >
                        {roll}
                      </button>
                    );
                  })
                ) : (
                  <p
                    className="col-span-full text-center text-lg"
                    style={{ color: theme.colors.tertiary }}
                  >
                    No members found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default ManageAttendance;
