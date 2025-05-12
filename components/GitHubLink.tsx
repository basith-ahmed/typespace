"use client";

import React from "react";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

const GitHubLink: React.FC = () => {
  return (
    <div className="absolute flex justify-center pb-8 cursor-pointer z-10">
      <a
        className="group rounded-full border border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-[#2c2e31] text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:hover:bg-neu[#2C2E31]"
        href="https://github.com/basith-ahmed/type-racer"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 dark:hover:text-neutral-400 hover:duration-300 shadow-sm rounded-full">
          <span>View on GitHub</span>
        </AnimatedShinyText>
      </a>
    </div>
  );
};

export default GitHubLink;
