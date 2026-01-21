import { useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader"; 
import Popup from "../components/Popup"; 
import { theme } from "../theme"; 
import LoadData from "./LoadData";

const ALL_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const getCurrentDate = new Date();
const ALL_YEARS = [
    "2025", "2026", "2027", "2028", "2029", "2030", 
    "2031", "2032", "2033", "2034", "2035"
];

const getDayOfWeek = (year, monthIndex, day) => {
    return new Date(Number(year), monthIndex, day).getDay();
};

const Attendance = () => {
    const currentYear = getCurrentDate.getFullYear().toString();
    const currentMonth = getCurrentDate.toLocaleDateString('en-US', { month: 'long' });

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [members, setMembers] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const normalizeMonthName = (monthName) => {
        if (!monthName) return '';
        return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    };

    useEffect(() => {
        const normalizedMonth = normalizeMonthName(month);
        const monthIndex = ALL_MONTHS.findIndex((m) => m.toLowerCase() === normalizedMonth.toLowerCase());
        const safeMonthIndex = monthIndex !== -1 ? monthIndex : 0;
        const numDays = new Date(Number(year), safeMonthIndex + 1, 0).getDate();
        const daysArray = [];
        for (let i = 1; i <= numDays; i++) {
            const date = new Date(Number(year), safeMonthIndex, i);
            const dayOfWeekShort = date.toLocaleDateString('en-US', { weekday: 'short' });
            daysArray.push({ day: i, dayOfWeek: dayOfWeekShort });
        }
        setDaysInMonth(daysArray);
    }, [year, month]);

    const fetchMembersFromLocalStorage = useCallback(async () => {
        setLoading(true);
        setPopupMessage("");
        setPopupType("");
        const minLoadPromise = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const storedMembers = localStorage.getItem('allMembers');
            let allMembersData = storedMembers ? JSON.parse(storedMembers) : [];
            allMembersData.sort((a, b) => {
                const rollA = parseInt(a.roll_no, 10);
                const rollB = parseInt(b.roll_no, 10);
                return (isNaN(rollA) ? 1 : isNaN(rollB) ? -1 : rollA - rollB);
            });

            const normalizedSelectedMonth = normalizeMonthName(month);
            const membersWithAttendance = allMembersData.map((member) => {
                const currentMonthAttendanceDays = member.attendance?.[year]?.[normalizedSelectedMonth] || [];
                let totalYearlyPoints = 0;
                const yearlyAttendance = member.attendance?.[year];
                if (yearlyAttendance) {
                    for (const monthName in yearlyAttendance) {
                        const mIndex = ALL_MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
                        if (mIndex === -1) continue;
                        yearlyAttendance[monthName].forEach(day => {
                            const dow = getDayOfWeek(year, mIndex, day);
                            totalYearlyPoints += (dow === 0 || dow === 6) ? 4 : 2;
                        });
                    }
                }
                return { ...member, attendance: currentMonthAttendanceDays, points: totalYearlyPoints };
            });
            setMembers(membersWithAttendance);
        } catch (error) {
            console.log(error)
            setPopupMessage("Failed to load attendance data.");
            setPopupType("error");
        } finally {
            await minLoadPromise;
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchMembersFromLocalStorage(); }, [fetchMembersFromLocalStorage]);

    const filteredMembers = members.filter(member => {
        const query = searchQuery.toLowerCase();
        return String(member.name || '').toLowerCase().includes(query) || 
               String(member.last_name || '').toLowerCase().includes(query) || 
               String(member.roll_no || '').toLowerCase().includes(query);
    });

    const handleCopyAttendance = (day) => {
        const presentRollNumbers = members.filter((m) => m.attendance.includes(day)).map((m) => m.roll_no);
        presentRollNumbers.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        const textToCopy = presentRollNumbers.join(", ");
        navigator.clipboard.writeText(textToCopy)
            .then(() => { setPopupMessage("Copied roll numbers!"); setPopupType("success"); })
            .catch(() => { setPopupMessage("Copy failed."); setPopupType("error"); });
    };

    return (
        <div className="p-3 md:p-10 font-[Inter,sans-serif]" style={{ background: theme.colors.background }}>
            <LoadData/>
            
            <div className="flex flex-row gap-4 mb-3 justify-center">
                <div className="relative flex-1">
                    <select value={year} onChange={(e) => setYear(e.target.value)} disabled={loading}
                        className="block appearance-none w-full bg-white py-3 px-4 pr-8 rounded-lg border shadow-sm outline-none"
                        style={{ borderColor: theme.colors.primaryLight, color: theme.colors.primary }}>
                        {ALL_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="relative flex-1">
                    <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={loading}
                        className="block appearance-none w-full bg-white py-3 px-4 pr-8 rounded-lg border shadow-sm outline-none"
                        style={{ borderColor: theme.colors.primaryLight, color: theme.colors.primary }}>
                        {ALL_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-3 flex justify-center">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={loading}
                    className="w-full max-w-md px-4 py-2 rounded-lg border shadow-sm outline-none focus:ring-2 bg-white"
                    style={{ borderColor: theme.colors.primaryLight, color: theme.colors.primary }} />
            </div>

            {loading ? (
                <div className="min-h-[400px] flex items-center justify-center w-full bg-white rounded-lg shadow-xl"><Loader /></div>
            ) : (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Fixed height container for scrolling ONLY when content exceeds screen space */}
                    <div className="overflow-auto max-h-[calc(100vh-280px)]">
                        <table className="w-full border-collapse table-auto">
                            <thead style={{ backgroundColor: theme.colors.tertiaryLight }} className="sticky top-0 z-50">
                                <tr>
                                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase sticky left-0 z-40 w-16 border border-gray-300"
                                        style={{ backgroundColor: theme.colors.tertiaryLight, color: theme.colors.primary }}>
                                        Roll No & Name
                                    </th>
                                    <th className="p-1 text-center text-xs font-semibold uppercase border border-gray-300 min-w-[30px]"
                                        style={{ color: theme.colors.primary }}>Points</th>
                                    {daysInMonth.map((dayData) => (
                                        <th key={dayData.day} onDoubleClick={() => handleCopyAttendance(dayData.day)}
                                            className="p-1 text-center text-xs font-semibold uppercase border border-gray-300 cursor-pointer min-w-[40px]"
                                            style={{ color: theme.colors.primary }}>
                                            {dayData.day}<br />{dayData.dayOfWeek}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y" style={{ borderColor: theme.colors.primaryLight }}>
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={daysInMonth.length + 2} className="text-center py-8 text-base border border-gray-300"
                                            style={{ color: theme.colors.primary }}>No members found.</td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.roll_no}>
                                            <td className="px-2 py-3 sticky left-0 z-10 shadow-sm w-16 border border-gray-300"
                                                style={{ backgroundColor: theme.colors.neutralLight }}>
                                                <div className="font-bold text-sm" style={{ color: theme.colors.neutralDark }}>{member.roll_no}</div>
                                                <div className="text-xs" style={{ color: theme.colors.primary }}>{member.name}</div>
                                            </td>
                                            <td className="p-1 text-center text-xs font-bold border border-gray-300"
                                                style={{ color: theme.colors.secondary }}>{member.points}</td>
                                            {daysInMonth.map((dayData) => (
                                                <td key={dayData.day} className="p-1 text-center text-xs border border-gray-300"
                                                    style={{ color: member.attendance.includes(dayData.day) ? theme.colors.success : theme.colors.primaryLight }}>
                                                    {member.attendance.includes(dayData.day) ? "✔" : ""}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Popup message={popupMessage} type={popupType} onClose={() => { setPopupMessage(""); setPopupType(""); }} />
        </div>
    );
};

export default Attendance;