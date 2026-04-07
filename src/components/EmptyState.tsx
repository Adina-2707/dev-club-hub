import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
        <Inbox className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground/70 mt-1.5 max-w-xs">{description}</p>}
    </div>
  );
}
