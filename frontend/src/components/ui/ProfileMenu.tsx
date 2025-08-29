import { useState } from "react";
import Link from "next/link";
import { User } from "@auth0/nextjs-auth0/types";
import { User as IconUser, Power as IconPower } from "lucide-react";
import Image from "next/image";

export default function ProfileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">Welcome, {user.name}</span>

        {user.picture && (
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            <Image
              src={user.picture}
              alt="profile"
              className="w-9 h-9 rounded-full border-2 border-white cursor-pointer"
            />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border p-2 z-50">
          <Link
            href="/profile"
            className="flex px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <IconUser />
            Profile
          </Link>
          <a
            href="/auth/logout"
            className="flex px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <IconPower />
            Log out
          </a>
        </div>
      )}
    </div>
  );
}
