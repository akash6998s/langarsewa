import { useState, useEffect } from "react";
import Loader from "./Loader";
import Popup from "./Popup";

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

  // Fetch Members
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

  // Popup Helper
  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  // Autofill Add/Edit
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

  // Handle Image Preview
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

  // Add or Edit Member
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

      if (!res.ok) {
        const data = await res.text();
        throw new Error(data);
      }

      showPopup("Member added/updated successfully.", "success");
      fetchMembers();

      // Reset form
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

  // Autofill Delete
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

  // Delete Member
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

      if (!res.ok) {
        const data = await res.text();
        throw new Error(data);
      }

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
    <div className="bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
          सदस्य प्रबंधन
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setTab("addEdit")}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "addEdit"
                ? "bg-[#4caf50] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-green-100"
            }`}
          >
            Add/Edit Member
          </button>
          <button
            onClick={() => setTab("delete")}
            className={`px-8 py-3 rounded-r-full border-y border-r border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "delete"
                ? "bg-[#e53935] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-red-100"
            }`}
          >
            Delete Member
          </button>
        </div>

        {/* Add/Edit */}
        {tab === "addEdit" && (
          <form
            onSubmit={handleAddEdit}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-full">
                <select
                  value={rollNumber}
                  onChange={handleRollNumberChange}
                  className="w-full border p-3 rounded-lg bg-[#fffdf7]"
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
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
              />

              {/* Image Upload */}
              <div className="col-span-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-3 rounded-lg bg-[#fffdf7]"
                />
                {picPreview && (
                  <div className="mt-2">
                    <img
                      src={picPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xl font-semibold transition shadow-lg"
              >
                Add / Edit Member
              </button>
            </div>
          </form>
        )}

        {/* Delete */}
        {tab === "delete" && (
          <form
            onSubmit={handleDelete}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md max-w-3xl mx-auto"
          >
            <select
              value={delRollNumber}
              onChange={(e) => setDelRollNumber(e.target.value)}
              className="w-full border p-3 rounded-lg bg-[#fffdf7]"
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
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={delLastName}
                readOnly
                className="w-full border p-3 rounded-lg bg-[#fffdf7]"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xl font-semibold transition shadow-lg"
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