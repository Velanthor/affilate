import { getInitials } from "@/lib/utils";

export function AdminHeader({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return (
    <header className="h-16 glass border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="lg:hidden w-8" />
      <div className="flex items-center gap-3 ml-auto">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-violet to-primary-500 flex items-center justify-center text-xs font-bold text-white">
          {getInitials(firstName, lastName)}
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-foreground leading-tight">{firstName} {lastName}</div>
          <div className="text-xs text-muted-foreground leading-tight">{email}</div>
        </div>
      </div>
    </header>
  );
}
