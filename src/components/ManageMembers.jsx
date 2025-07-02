import { useState, useEffect } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { theme } from "../theme";

function ManageMember() {
  const [tab, setTab] = useState("addEdit");

  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [pic, setPic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);

  const [delRollNumber, setDelRollNumber] = useState("");
  const [delName, setDelName] = useState("");
  const [delLastName, setDelLastName] = useState("");

  const [members, setMembers] = useState([]);
  const [rollNumbers, setRollNumbers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const API_URL = "https://langar-backend.onrender.com/api/members";

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}`);
      const data = await res.json();

      setMembers(data);
      const rolls = data.map((m) => m.RollNumber).sort((a, b) => a - b);
      setRollNumbers(rolls);
    } catch (err) {
      showPopup("Error fetching members.", err);
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

  const handleRollNumberChange = (e) => {
    const value = e.target.value;
    setRollNumber(value);

    const member = members.find((m) => m.RollNumber === value);
    if (member) {
      setName(member.Name || "");
      setLastName(member.LastName || "");
      setPhone(member.PhoneNumber || "");
      setAddress(member.Address || "");
    } else {
      setName("");
      setLastName("");
      setPhone("");
      setAddress("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPic(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPicPreview(null);
    }
  };

  const handleAddEdit = async (e) => {
    e.preventDefault();
    if (!rollNumber || !name) {
      showPopup("Roll Number and Name are required.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("RollNumber", rollNumber);
    formData.append("Name", name);
    formData.append("LastName", lastName);
    formData.append("PhoneNumber", phone);
    formData.append("Address", address);
    if (pic) {
      formData.append("Photo", pic);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/add`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      showPopup("Member added/updated successfully.", "success");
      fetchMembers();

      setRollNumber("");
      setName("");
      setLastName("");
      setPhone("");
      setAddress("");
      setPic(null);
      setPicPreview(null);
    } catch (err) {
      showPopup(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const member = members.find((m) => m.RollNumber === delRollNumber);
    if (member) {
      setDelName(member.Name);
      setDelLastName(member.LastName);
    } else {
      setDelName("");
      setDelLastName("");
    }
  }, [delRollNumber, members]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!delRollNumber) {
      showPopup("Select Roll Number to delete.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RollNumber: delRollNumber }),
      });

      if (!res.ok) throw new Error(await res.text());

      showPopup("Member deleted successfully.", "success");
      fetchMembers();

      setDelRollNumber("");
      setDelName("");
      setDelLastName("");
    } catch (err) {
      showPopup(`Error: ${err.message}`, "error");
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
          Manage Member
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("addEdit")}
            className={`px-8 py-3 rounded-l-full border text-lg shadow-md ${
              tab === "addEdit"
                ? "text-white font-semibold scale-105"
                : "hover:bg-amber-100"
            }`}
            style={{
              borderColor: theme.colors.primaryLight,
              background:
                tab === "addEdit"
                  ? `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`
                  : theme.colors.surface,
              color: tab === "addEdit"
                ? theme.colors.surface
                : theme.colors.primary,
            }}
          >
            Add / Edit Member
          </button>

          <button
            onClick={() => setTab("delete")}
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
              color: tab === "delete"
                ? theme.colors.surface
                : theme.colors.primary,
            }}
          >
            Delete Member
          </button>
        </div>

        {/* Add/Edit Form */}
        {tab === "addEdit" && (
          <form
            onSubmit={handleAddEdit}
            className="rounded-3xl shadow-xl p-8 space-y-6 border"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primaryLight,
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-full">
                <select
                  value={rollNumber}
                  onChange={handleRollNumberChange}
                  className="w-full border p-3 rounded-xl shadow-md"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <option value="">Select Roll Number</option>
                  {rollNumbers.map((roll) => (
                    <option key={roll} value={roll}>
                      {roll}
                    </option>
                  ))}
                  {(() => {
                    const maxRoll = Math.max(...rollNumbers, 0);
                    const nextRoll = maxRoll + 1;
                    return <option value={nextRoll}>{nextRoll} (New)</option>;
                  })()}
                </select>
              </div>

              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
              />

              <div className="col-span-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-3 rounded-xl shadow-md"
                  style={{ backgroundColor: theme.colors.surface }}
                />
                {picPreview && (
                  <div className="mt-2">
                    <img
                      src={picPreview}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-full border shadow"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-white text-xl font-semibold transition shadow-lg"
                style={{ backgroundColor: theme.colors.secondary }}
              >
                Add / Edit Member
              </button>
            </div>
          </form>
        )}

        {/* Delete Form */}
        {tab === "delete" && (
          <form
            onSubmit={handleDelete}
            className="rounded-3xl shadow-xl p-8 space-y-6 border"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primaryLight,
            }}
          >
            <select
              value={delRollNumber}
              onChange={(e) => setDelRollNumber(e.target.value)}
              className="w-full border p-3 rounded-xl shadow-md"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <option value="">Select Roll Number</option>
              {rollNumbers.map((roll) => (
                <option key={roll} value={roll}>
                  {roll}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name"
                value={delName}
                readOnly
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={delLastName}
                readOnly
                className="w-full border p-3 rounded-xl shadow-md"
                style={{ backgroundColor: theme.colors.surface }}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-white text-xl font-semibold transition shadow-lg"
                style={{ backgroundColor: theme.colors.accent }}
              >
                Delete Member
              </button>
            </div>
          </form>
        )}
      </div>

      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default ManageMember;
