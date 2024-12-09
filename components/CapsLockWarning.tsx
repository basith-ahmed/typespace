"use client";

import React from "react";
import { MessageSquareWarningIcon } from "lucide-react";

interface CapsLockWarningProps {
  darkMode: boolean;
}

const CapsLockWarning: React.FC<CapsLockWarningProps> = ({ darkMode }) => {
  return (
    <div className="mt-2 flex items-center text-gray-900 dark:text-gray-400 dark:bg-[#2C2E31] p-2 px-4 mb-4 bg-gray-400 rounded-md">
      <MessageSquareWarningIcon className="w-4 h-4 mr-1" />
      Caps Lock is on
    </div>
  );
};

export default CapsLockWarning;
