import { Comment } from "@/contexts/DataContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface CommentSectionProps {
  comments: Comment[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  emptyText: string;
  isAuthenticated: boolean;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export function CommentSection({
  comments,
  value,
  onChange,
  onSubmit,
  placeholder,
  emptyText,
  isAuthenticated,
}: CommentSectionProps) {
  return (
    <div className="space-y-3 pt-2 fade-in">
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-muted/50 bg-muted/40 p-4 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-2xl border border-muted/50 bg-muted/50 p-3">
              <Avatar>
                <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{comment.authorName}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated && (
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="h-11 text-sm"
          />
          <Button size="sm" onClick={onSubmit} className="h-11 px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
