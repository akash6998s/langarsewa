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
  const [formMessage, setFormMessage] = useState(""); // State for success/error messages

  // State to hold fetched roll numbers
  const [rollNumbers, setRollNumbers] = useState([]);

  // Fetch members on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("https://langarsewa-db.onrender.com/members");
        if (!response.ok) {
          throw new Error("Failed to fetch members data");
        }
        const data = await response.json();
        // Extract roll_no and set it to rollNumbers state
        const fetchedRollNumbers = data
          .map((member) => member.roll_no)
          .sort((a, b) => a - b);
        setRollNumbers(fetchedRollNumbers);

        // Set the fetched members to the members state
        setMembers(
          data.map((member) => ({
            id: member.roll_no, // Using roll_no as id for simplicity
            pic: member.img, // Assuming img is a path/URL
            name: member.name,
            lastName: member.last_name,
            address: member.address,
            phone: member.phone_no,
            email: member.email,
            rollNumber: member.roll_no,
          }))
        );

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
    setFormMessage(""); // Clear any previous messages

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
      // If a member has an existing picture from backend, set it to picPreview
      // Do NOT set `pic` (File object) here, as it would re-trigger the picPreview useEffect unnecessarily
      // and we only want `pic` to hold a *newly selected file*.
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
  const handleAddEditMember = async (e) => {
    e.preventDefault();
    setFormMessage(""); // Clear previous messages

    // Only check if rollNumber and name are provided
    if (!rollNumber || !name.trim()) {
      setFormMessage("Please enter Roll Number and First Name.");
      return;
    }

    // If phone is entered, validate its format
    if (phone.trim() && !/^\d{10}$/.test(phone)) {
      setFormMessage("Phone number must be 10 digits.");
      return;
    }

    // If email is entered, validate its format
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormMessage("Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.append("rollNumber", rollNumber);
    formData.append("name", name);
    formData.append("last_name", lastName);
    formData.append("phone_no", phone);
    formData.append("email", email);
    formData.append("address", address);

    if (pic) {
      formData.append("img", pic);
    }

    try {
      setLoading(true);
      const response = await fetch("https://langarsewa-db.onrender.com/members/update", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${
              rollNumbers.includes(parseInt(rollNumber)) ? "update" : "add"
            } member.`
        );
      }

      const responseData = await response.json();
      setFormMessage(
        responseData.message ||
          `Member ${
            rollNumbers.includes(parseInt(rollNumber)) ? "updated" : "added"
          } successfully!`
      );

      // Re-fetch updated members
      const fetchResponse = await fetch("https://langarsewa-db.onrender.com/members");
      if (!fetchResponse.ok) {
        throw new Error("Failed to re-fetch members after update.");
      }
      const updatedMembersData = await fetchResponse.json();
      const fetchedRollNumbers = updatedMembersData
        .map((member) => member.roll_no)
        .sort((a, b) => a - b);
      setRollNumbers(fetchedRollNumbers);

      setMembers(
        updatedMembersData.map((member) => ({
          id: member.roll_no,
          pic: member.img,
          name: member.name,
          lastName: member.last_name,
          address: member.address,
          phone: member.phone_no,
          email: member.email,
          rollNumber: member.roll_no,
        }))
      );

      // Clear form
      setPic(null);
      setPicPreview(null);
      setRollNumber("");
      setName("");
      setLastName("");
      setAddress("");
      setPhone("");
      setEmail("");
    } catch (err) {
      setFormMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete member handler
  const handleDeleteMember = async (e) => {
    e.preventDefault();
    setFormMessage("");

    if (!delRollNumber) {
      setFormMessage("Please select a Roll Number to delete.");
      return;
    }

    const payload = {
      rollNumber: parseInt(delRollNumber),
    };

    const endpoints = [
      {
        url: "https://langarsewa-db.onrender.com/members/delete-details",
        label: "Member Details",
      },
      {
        url: "https://langarsewa-db.onrender.com/donations/delete-member",
        label: "Donations",
      },
      {
        url: "https://langarsewa-db.onrender.com/attendance/delete-member",
        label: "Attendance",
      },
      { url: "https://langarsewa-db.onrender.com/signup/delete-user", label: "User Signup" },
    ];

    const errorMessages = [];

    try {
      setLoading(true);

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            errorMessages.push(
              `${endpoint.label}: ${
                errorData.message || "Unknown error occurred"
              }`
            );
          }
        } catch (innerErr) {
          errorMessages.push(`${innerErr.message}`);
        }
      }

      if (errorMessages.length === 0) {
        setFormMessage("Member and associated data deleted successfully!");
      } else {
        setFormMessage(`Some errors occurred:\n${errorMessages.join("\n")}`);
      }

      // Fetch updated members list
      const fetchResponse = await fetch("https://langarsewa-db.onrender.com/members");
      if (!fetchResponse.ok) {
        throw new Error("Failed to re-fetch members after deletion.");
      }
      const updatedMembersData = await fetchResponse.json();
      const fetchedRollNumbers = updatedMembersData
        .map((member) => member.roll_no)
        .sort((a, b) => a - b);
      setRollNumbers(fetchedRollNumbers);

      setMembers(
        updatedMembersData.map((member) => ({
          id: member.roll_no,
          pic: member.img,
          name: member.name,
          lastName: member.last_name,
          address: member.address,
          phone: member.phone_no,
          email: member.email,
          rollNumber: member.roll_no,
        }))
      );

      setDelRollNumber("");
      setDelName("");
      setDelLastName("");
    } catch (err) {
      setFormMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
            onClick={() => {
              setTab("addEdit");
              setFormMessage("");
            }}
            className={`px-8 py-3 rounded-l-full border-y border-l border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "addEdit"
                ? "bg-[#4caf50] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-green-100"
            }`}
          >
            Add/Edit Member
          </button>
          <button
            onClick={() => {
              setTab("delete");
              setFormMessage("");
            }}
            className={`px-8 py-3 rounded-r-full border-y border-r border-[#c08457] text-lg transition-all duration-300 shadow-sm ${
              tab === "delete"
                ? "bg-[#e53935] text-white font-semibold shadow-lg"
                : "bg-white text-[#4e342e] hover:bg-red-100"
            }`}
          >
            Delete Member
          </button>
        </div>

        {formMessage && (
          <p
            className={`text-center text-lg font-medium mb-4 ${
              formMessage.startsWith("Error")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {formMessage}
          </p>
        )}

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
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const validTypes = ["image/jpeg", "image/png"];
                      if (validTypes.includes(file.type)) {
                        setPic(file);
                      } else {
                        alert("Only JPG and PNG files are allowed.");
                        e.target.value = null; // reset input
                      }
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
                  className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
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
              />

              {/* Phone Number */}
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
                pattern="\d{10}"
                title="Phone number must be 10 digits"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
              />
              {/* Address */}
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-3 rounded-lg bg-[#fffdf7] focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2"
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
