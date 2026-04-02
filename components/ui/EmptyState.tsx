// @TASK P1-S0-T1 - EmptyState: displayed when no data is available
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-[#F3F4F6]">
        <Icon size={32} className="text-[#6B7280]" />
      </div>
      <h3 className="text-base font-semibold text-[#374151] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
    </div>
  );
}
