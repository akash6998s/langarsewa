import { useState, useEffect } from "react";
import Loader from "./Loader";



function ManageMember() {
  const [tab, setTab] = useState("addEdit");

  // Member details state for Add/Edit
  const [pic, setPic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [rollNumber, setRollNumber] = useState(""); // Initialize with an empty string
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Delete member state
  const [delRollNumber, setDelRollNumber] = useState(""); // Initialize with an empty string
  const [delName, setDelName] = useState("");
  const [delLastName, setDelLastName] = useState("");

  // Example members list state to simulate existing members
  const [members, setMembers] = useState([]); // This will hold the fetched members

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to hold fetched roll numbers
  const [rollNumbers, setRollNumbers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("https://langarsewa-db.onrender.com/members");
        if (!response.ok) {
          throw new Error("Failed to fetch members data");
        }
        const data = await response.json();
        // Extract roll_no and set it to rollNumbers state
        const fetchedRollNumbers = data.map((member) => member.roll_no);
        setRollNumbers(fetchedRollNumbers);

        // Set the fetched members to the members state
        setMembers(data.map(member => ({
          id: member.roll_no, // Using roll_no as id for simplicity
          pic: member.img, // Assuming img is a path/URL
          name: member.name,
          lastName: member.last_name,
          address: member.address,
          phone: member.phone_no,
          email: member.email,
          rollNumber: member.roll_no,
        })));

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []); // Empty dependency array means this effect runs once on mount

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

  // useEffect for Delete Member: Autofill name and last name based on selected delRollNumber
  useEffect(() => {
    if (tab === "delete" && delRollNumber) {
      const selectedMember = members.find(
        (member) => member.rollNumber === parseInt(delRollNumber)
      );
      if (selectedMember) {
        setDelName(selectedMember.name);
        setDelLastName(selectedMember.lastName);
      } else {
        setDelName("");
        setDelLastName("");
      }
    } else if (tab === "delete" && !delRollNumber) {
      // Clear fields if no roll number is selected in delete tab
      setDelName("");
      setDelLastName("");
    }
  }, [delRollNumber, members, tab]); // Depend on delRollNumber, members, and tab

  // Handler to autofill fields when a roll number is selected in Add/Edit tab
  const handleRollNumberChange = (e) => {
    const selectedRollNumber = e.target.value; // Keep as string for comparison with option value

    setRollNumber(selectedRollNumber);

    // If an empty value is selected, clear all fields
    if (!selectedRollNumber) {
      setName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setPic(null);
      setPicPreview(null);
      return;
    }

    const selectedMember = members.find(
      (member) => member.rollNumber === parseInt(selectedRollNumber)
    );

    if (selectedMember) {
      setName(selectedMember.name);
      setLastName(selectedMember.lastName);
      setPhone(selectedMember.phone);
      setEmail(selectedMember.email);
      setAddress(selectedMember.address);
      if (selectedMember.pic) {
        setPicPreview(selectedMember.pic);
      } else {
        setPicPreview(null);
      }
      setPic(null); // Clear the file input for new upload
    } else {
      // This case should ideally not happen if data is consistent, but for safety:
      setName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setPic(null);
      setPicPreview(null);
    }
  };

  // Add or Edit member handler
  const handleAddEditMember = (e) => {
    e.preventDefault();

    if (
      !rollNumber || // Ensure roll number is selected/entered
      !name.trim() ||
      !lastName.trim() ||
      !address.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Simple phone number validation
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const rollNumInt = parseInt(rollNumber);
    const existingIndex = members.findIndex((m) => m.rollNumber === rollNumInt);

    const newMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : Date.now(),
      pic: picPreview, // This will be a blob URL, consider how to handle image uploads to backend
      name,
      lastName,
      address,
      phone,
      email,
      rollNumber: rollNumInt, // Ensure rollNumber is a number
    };

    let updatedMembers;
    if (existingIndex >= 0) {
      updatedMembers = [...members];
      updatedMembers[existingIndex] = newMember;
      alert("Member updated!");
    } else {
      updatedMembers = [...members, newMember];
      alert("Member added!");
      // If a new member is added, also update the rollNumbers list for the dropdown
      setRollNumbers(prevRollNumbers => [...prevRollNumbers, rollNumInt].sort((a, b) => a - b));
    }

    setMembers(updatedMembers);

    // Optionally clear form fields after submission for new entry
    setPic(null);
    setPicPreview(null);
    setRollNumber("");
    setName("");
    setLastName("");
    setAddress("");
    setPhone("");
    setEmail("");
  };

  // Delete member handler
  const handleDeleteMember = (e) => {
    e.preventDefault();

    if (!delRollNumber || !delName.trim() || !delLastName.trim()) {
      alert("Please select a roll number and enter name and last name.");
      return;
    }

    const filteredMembers = members.filter(
      (m) =>
        !(
          m.rollNumber === parseInt(delRollNumber) && // Ensure comparison is with number
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

    // Also remove from rollNumbers list
    setRollNumbers(prevRollNumbers => prevRollNumbers.filter(roll => roll !== parseInt(delRollNumber)));

    // Clear delete inputs
    setDelRollNumber(""); // Set to empty string
    setDelName("");
    setDelLastName("");
  };

  if (loading) {
    return <Loader />;
  }

  if (error)
    return (
      <p className="text-center text-red-500 font-medium text-lg mt-8">
        {error}
      </p>
    );

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
              {/* Roll Number */}
              <div className="col-span-full">
                <select
                  value={rollNumber}
                  onChange={handleRollNumberChange}
                  className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  <option value="">Select Roll Number</option>
                  {rollNumbers.map((roll) => (
                    <option key={roll} value={roll}>
                      {roll}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                pattern="\d{10}"
                title="Phone number must be 10 digits"
              />

              {/* Name */}
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                required
              />
              {/* Last Name */}
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                required
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                required
              />
              {/* Address */}
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                required
              />
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
                onChange={(e) => setDelName(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                readOnly
              />
              <input
                type="text"
                placeholder="Last Name"
                value={delLastName}
                onChange={(e) => setDelLastName(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                readOnly
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
    </div>
  );
}

export default ManageMember;