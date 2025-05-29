import { useState, useEffect } from "react";

const rollNumbers = [
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
];

function ManageMember() {
  const [tab, setTab] = useState("addEdit");

  // Member details state for Add/Edit
  const [pic, setPic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState(rollNumbers[0]);

  // Delete member state
  const [delRollNumber, setDelRollNumber] = useState(rollNumbers[0]);
  const [delName, setDelName] = useState("");
  const [delLastName, setDelLastName] = useState("");

  // Example members list state to simulate existing members
  const [members, setMembers] = useState([]);

  // Update pic preview when pic changes
  useEffect(() => {
    if (!pic) {
      setPicPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(pic);
    setPicPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [pic]);

  // Add or Edit member handler
  const handleAddEditMember = (e) => {
    e.preventDefault();

    if (!name.trim() || !lastName.trim() || !address.trim() || !phone.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    // Simple phone number validation
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    // Check if member with rollNumber exists - edit if exists, else add new
    const existingIndex = members.findIndex((m) => m.rollNumber === rollNumber);

    const newMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : Date.now(),
      pic: picPreview,
      name,
      lastName,
      address,
      phone,
      rollNumber,
    };

    let updatedMembers;
    if (existingIndex >= 0) {
      updatedMembers = [...members];
      updatedMembers[existingIndex] = newMember;
      alert("Member updated!");
    } else {
      updatedMembers = [...members, newMember];
      alert("Member added!");
    }

    setMembers(updatedMembers);

    // Clear form after add (optional)
    // setPic(null);
    // setPicPreview(null);
    // setName("");
    // setLastName("");
    // setAddress("");
    // setPhone("");
  };

  // Delete member handler
  const handleDeleteMember = (e) => {
    e.preventDefault();

    if (!delName.trim() || !delLastName.trim()) {
      alert("Please enter name and last name.");
      return;
    }

    const filteredMembers = members.filter(
      (m) =>
        !(
          m.rollNumber === delRollNumber &&
          m.name.toLowerCase() === delName.toLowerCase() &&
          m.lastName.toLowerCase() === delLastName.toLowerCase()
        )
    );

    if (filteredMembers.length === members.length) {
      alert("No matching member found to delete.");
      return;
    }

    setMembers(filteredMembers);
    alert("Member deleted!");

    // Clear delete inputs
    setDelName("");
    setDelLastName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif">
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

        {/* Add/Edit Member Form */}
        {tab === "addEdit" && (
          <form
            onSubmit={handleAddEditMember}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Picture upload and preview */}
              <label className="cursor-pointer">
                <div className="w-36 h-36 rounded-full border-4 border-yellow-300 overflow-hidden shadow-md bg-yellow-50 flex items-center justify-center">
                  {picPreview ? (
                    <img
                      src={picPreview}
                      alt="Member Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-yellow-400 font-semibold">
                      Upload Pic
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setPic(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                pattern="\d{10}"
                title="Phone number must be 10 digits"
              />
              <select
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                {rollNumbers.map((roll) => (
                  <option key={roll} value={roll}>
                    Roll Number {roll}
                  </option>
                ))}
              </select>
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

        {/* Delete Member Form */}
        {tab === "delete" && (
          <form
            onSubmit={handleDeleteMember}
            className="bg-white/80 p-8 rounded-3xl shadow-2xl border border-yellow-100 space-y-6 backdrop-blur-md max-w-3xl mx-auto"
          >
            <select
              value={delRollNumber}
              onChange={(e) => setDelRollNumber(e.target.value)}
              className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            >
              {rollNumbers.map((roll) => (
                <option key={roll} value={roll}>
                  Roll Number {roll}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name"
                value={delName}
                onChange={(e) => setDelName(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={delLastName}
                onChange={(e) => setDelLastName(e.target.value)}
                className="border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
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

        {/* Display current members */}
        {members.length > 0 && (
          <div className="mt-10 bg-white/90 p-6 rounded-3xl shadow-lg border border-yellow-200 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-[#6d4c41] text-center">
              Current Members
            </h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {members.map(({ id, pic, name, lastName, address, phone, rollNumber }) => (
                <li
                  key={id}
                  className="flex items-center space-x-4 bg-yellow-50 rounded-lg p-3 shadow-sm border border-yellow-100"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 shadow-md flex-shrink-0">
                    {pic ? (
                      <img
                        src={pic}
                        alt={`${name} ${lastName}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-yellow-200 text-yellow-500 font-semibold">
                        No Pic
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-[#4e342e] text-lg">
                      {name} {lastName}
                    </p>
                    <p className="text-sm text-[#7b451e]">Roll Number: {rollNumber}</p>
                    <p className="text-sm text-[#7b451e]">Phone: {phone}</p>
                    <p className="text-sm text-[#7b451e]">Address: {address}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageMember;
