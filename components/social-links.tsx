"use client";

import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import { Github, Keyboard, YoutubeIcon } from "lucide-react";

const SocialMediaLinks = () => {
  return (
    <div className="flex flex-row gap-4 items-center ">
      <a
        href="https://github.com/malvarez88"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github width={20} height={20} />
      </a>
      <a
        href="https://www.marianodev.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Keyboard width={20} height={20} />
      </a>
      <a
        href="https://www.linkedin.com/in/malvarez88/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkedInLogoIcon width={20} height={20} />
      </a>
    </div>
  );
};

export default SocialMediaLinks;
