import { ShieldX, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-foreground">
          Доступ запрещен
        </h1>

        <p className="mb-8 text-muted-foreground">
          {message || "У вас нет прав для доступа к этой странице. Обратитесь к администратору, если считаете, что это ошибка."}
        </p>

        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
