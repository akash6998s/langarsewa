import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  List,
  Bell,
  User,
  MoreHorizontal,
  ClipboardList,
  DollarSign,
  FileText,
  Users,
  Banknote,
  LayoutDashboard,
} from "lucide-react";

function Navbar() {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMore(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-[100] md:static md:shadow-none md:border-none">
      <ul className="flex justify-around md:justify-start md:gap-10 p-2 text-sm text-gray-600 relative">
        {/* Main nav items */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/activity"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            <List size={20} />
            <span className="text-xs">Activity</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/notice"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            <Bell size={20} />
            <span className="text-xs">Notice</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            <User size={20} />
            <span className="text-xs">Profile</span>
          </NavLink>
        </li>

        {/* More menu container */}
        <li ref={moreRef} className="relative flex flex-col items-center">
          {/* Submenu */}
          {showMore && (
            <ul
              id="more-menu"
              className="absolute bottom-full mb-2 flex flex-col bg-white border border-gray-200 rounded shadow-md"
              style={{ left: "50%", transform: "translateX(-70%)" }}
            >
              <li>
                <NavLink
                  to="/userslist"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/managemembers"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <Users size={16} />
                  Members
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manageattendance"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <ClipboardList size={16} />
                  Attendance
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/managedonation"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <DollarSign size={16} />
                  Donation
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/managefinance"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <Banknote size={16} />
                  Finance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/manageexpense"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                  onClick={() => setShowMore(false)}
                >
                  <FileText size={16} />
                  Expense
                </NavLink>
              </li>
            </ul>
          )}

          {/* More button */}
          <button
            onClick={() => setShowMore((prev) => !prev)}
            className="flex flex-col items-center text-gray-500 focus:outline-none"
            aria-expanded={showMore}
            aria-controls="more-menu"
          >
            <MoreHorizontal size={20} />
            <span className="text-xs">More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
