import { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { theme } from "../theme";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const dates = Array.from({ length: 31 }, (_, i) => i + 1);

function ManageAttendance() {
  const today = new Date();
  const [tab, setTab] = useState("add");
  const [selectedMonth, setSelectedMonth] = useState(months[today.getMonth()]);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
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
      showPopup("Failed to load members.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
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
    } catch (error) {
      showPopup("Network error. Please check your connection.", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="font-serif" style={{ color: theme.colors.neutralDark }}>
      <div className="mx-auto px-4 pt-4 max-w-4xl pb-20">
        <h1
          className="text-2xl font-extrabold text-center mb-10 tracking-wide drop-shadow-md"
          style={{ color: theme.colors.primary }}
        >
          Manage Attendance
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleTabChange("add")}
            className={`px-8 py-3 rounded-l-full border text-lg shadow-md ${
              tab === "add"
                ? "text-white font-semibold scale-105"
                : "hover:bg-amber-100"
            }`}
            style={{
              borderColor: theme.colors.primaryLight,
              background:
                tab === "add"
                  ? `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`
                  : theme.colors.surface,
              color: tab === "add" ? theme.colors.surface : theme.colors.primary,
            }}
          >
            Add Attendance
          </button>
          <button
            onClick={() => handleTabChange("delete")}
            className={`px-8 py-3 rounded-r-full border text-lg shadow-md ${
              tab === "delete"
                ? "text-white font-semibold scale-105"
                : "hover:bg-rose-100"
            }`}
            style={{
              borderColor: theme.colors.primaryLight,
              background:
                tab === "delete"
                  ? `linear-gradient(to right, ${theme.colors.accent}, #f43f5e)`
                  : theme.colors.surface,
              color: tab === "delete" ? theme.colors.surface : theme.colors.primary,
            }}
          >
            Delete Attendance
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl shadow-xl p-8 space-y-6 border"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primaryLight,
          }}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.surface }}
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
              style={{ backgroundColor: theme.colors.surface }}
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
              style={{ backgroundColor: theme.colors.surface }}
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
              className="text-white px-8 py-3 rounded-xl hover:scale-105 transition shadow-md"
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
              className="w-full py-4 rounded-2xl text-white text-xl font-semibold transition-all duration-300 shadow-lg"
              style={{
                backgroundColor:
                  tab === "add" ? theme.colors.secondary : theme.colors.accent,
              }}
            >
              {tab === "add" ? "Submit Attendance" : "Delete Attendance"}
            </button>
          </div>
        </form>
      </div>

      {/* Roll Number Popup */}
      {showPopupRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="relative w-[95%] max-w-lg overflow-y-auto rounded-3xl border px-4 pb-12 shadow-2xl max-h-[90vh]"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primaryLight,
            }}
          >
            <button
              onClick={() => setShowPopupRoll(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md hover:scale-110 transition"
              style={{
                backgroundColor: theme.colors.accent,
              }}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="mb-6 grid grid-cols-4 gap-4 pt-24">
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.RollNumber);
                  const isSelected = selectedRolls.includes(roll);

                  return (
                    <button
                      key={member.RollNumber}
                      onClick={() => toggleRoll(roll)}
                      className={`flex items-center justify-center rounded-xl border p-3 text-lg font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 transform hover:shadow-md ${
                        isSelected ? "scale-105 shadow-lg" : ""
                      }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`
                          : theme.colors.surface,
                        color: isSelected
                          ? theme.colors.surface
                          : theme.colors.primary,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.neutralLight,
                      }}
                    >
                      {member.RollNumber}
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
