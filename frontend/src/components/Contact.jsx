import React from "react";
import Avatar from "./Avatar";

function Contact({userId,onClick,selected,username,online}) {
  return (
    <div
      onClick={() => onClick(userId)}
      className={`ripple border-b border-gray-500 text-2xl font-mono ${
        selected ? "bg-zinc-200" : ""
      } flex items-center gap-2 cursor-pointer`}
      key={userId}
    >
      {selected && (
        <div className="w-1 absolute bg-zinc-600 h-14 rounded-r-md text-2xl font-mono"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center text-2xl font-mono">
        <Avatar online={online} username={username} userId={userId} />
        <span className="text-black font-bold opacity-70">
          {username.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default Contact;
