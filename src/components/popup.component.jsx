import { useState, useRef, useEffect } from "react";

export const PopupMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  const togglePopup = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={popupRef}>
      <button onClick={togglePopup}>
        {trigger}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 min-w-48 bg-white shadow-sm py-2 z-10 border border-grey">
          {children}
        </div>
      )}
    </div>
  );
};