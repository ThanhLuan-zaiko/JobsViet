import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar: React.FC = () => {
  return (
    <div className="flex-1 max-w-xl mx-4">
      <div className="flex border border-gray-300 rounded-full overflow-hidden">
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          className="flex-1 px-4 py-2 focus:outline-none text-black bg-white"
        />
        <button className="px-6 py-2 bg-gray-100 border-l border-gray-300 text-gray-600 hover:bg-gray-200">
          <FaSearch className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
