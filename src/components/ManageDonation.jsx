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

function ManageDonation() {
  // --- MODIFIED YEAR LOGIC ---
  const startYear = 2025;
  const endYear = 2035;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  // --- END MODIFIED YEAR LOGIC ---

  const [tab, setTab] = useState("add");
  const [year, setYear] = useState(new Date().getFullYear()); // Set initial year to current year or 2025 if current year is earlier
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [amount, setAmount] = useState("");

  const [showPopupRoll, setShowPopupRoll] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // Ensure the initial selected year is within the new range if it's outside
    if (year < startYear || year > endYear) {
      setYear(startYear); // Default to the first year in the new range
    }
  }, []);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  const toggleRoll = (roll) => {
    setSelectedRolls((prev) => {
      if (prev.length === 1 && prev[0] === roll) {
        return [];
      }
      return [roll];
    });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedRolls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === "add" && (!amount || isNaN(amount) || Number(amount) <= 0)) {
      showPopup("Please enter a valid donation amount.", "error");
      return;
    }

    if (selectedRolls.length === 0) {
      showPopup("Please select a roll number.", "error");
      return;
    }

    try {
      setLoading(true);

      const roll = selectedRolls[0];

      const payload = {
        RollNumber: roll,
        Year: String(year),
        Month: selectedMonth,
        Amount: amount,
      };

      const apiUrl =
        tab === "add"
          ? `${API_URL}/donations/add`
          : `${API_URL}/donations/delete`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Something went wrong");
      }

      showPopup(
        tab === "add"
          ? "Donation added successfully!"
          : "Donation deleted successfully!",
        "success"
      );

      setSelectedRolls([]);
      setAmount("");
      setShowPopupRoll(false);
    } catch (error) {
      showPopup(error.message || "Something went wrong.", "error");
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
            Manage Donation
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
            Add Donation
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
            Delete Donation
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl shadow-xl p-8 space-y-6"
          style={{
            backgroundColor: theme.colors.neutralLight
          }}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.neutralLight }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

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

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Donation Amount"
              required={tab === "add"}
              className="border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.neutralLight }}
              min="0"
            />
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
              Select Roll Number
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
              {tab === "add" ? "Submit Donation" : "Delete Donation"}
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
            className="w-[95%] max-w-lg overflow-y-auto rounded-3xl border px-4 pb-12 shadow-2xl max-h-[90vh]"
            style={{
              backgroundColor: theme.colors.neutralLight,
              borderColor: theme.colors.primary,
              color: theme.colors.neutralDark,
            }}
          >
            <div className="flex justify-between items-center px-1 pt-6 pb-4">
              <h2
                className="text-center font-bold text-xl pt-6 pb-4"
                style={{ color: theme.colors.primary }}
              >
                Select Roll Number
              </h2>
              <button
                onClick={() => setShowPopupRoll(false)}
                className="right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
                style={{
                  backgroundColor: theme.colors.danger,
                }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4 pt-2">
              {members.length > 0 ? (
                members.map((member) => {
                  const roll = String(member.RollNumber);
                  const isSelected = selectedRolls.length === 1 && selectedRolls[0] === roll;

                  return (
                    <button
                      key={roll}
                      onClick={() => toggleRoll(roll)}
                      className="flex items-center justify-center rounded-xl border p-3 text-lg font-bold shadow-sm"
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
      )}

      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default ManageDonation;