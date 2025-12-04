export function getInitials(name: string): string {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-white",
    "bg-red-500 text-white",
    "bg-purple-500 text-white",
    "bg-pink-500 text-white",
    "bg-indigo-500 text-white",
    "bg-teal-500 text-white",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
