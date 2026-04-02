// @TASK P1-S0-T1 - CategoryBadge: pill-shaped badge for category with emoji icon
interface CategoryBadgeProps {
  name: string;
  icon: string;
}

export default function CategoryBadge({ name, icon }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium"
      style={{
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
        borderRadius: "9999px",
        padding: "4px 12px",
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {name}
    </span>
  );
}
