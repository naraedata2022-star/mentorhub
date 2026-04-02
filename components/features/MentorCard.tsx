// @TASK P1-S0-T1 - MentorCard: displays mentor info and navigates to mentor detail page
"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface MentorCardProps {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  region: string;
}

export default function MentorCard({
  id,
  name,
  avatarUrl,
  skills,
  region,
}: MentorCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/mentoring/${id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#818CF8] transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#F3F4F6]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} 프로필 사진`}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-[#6B7280]">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] mb-1">{name}</p>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="inline-block px-2 py-0.5 text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5] rounded-full"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-[#F3F4F6] text-[#6B7280] rounded-full">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Region */}
          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
            <MapPin size={12} />
            <span>{region}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
