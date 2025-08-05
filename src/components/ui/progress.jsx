import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * Componente de barra de progresso. Recebe `value` (0 a 100) e
 * `indicatorClassName` para definir a cor da barra interna.
 *
 * Exemplo de uso:
 *   <Progress value={42} indicatorClassName="bg-green-500" />
 */
const Progress = React.forwardRef(
  ({ className, value, indicatorClassName, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full transition-all",
          indicatorClassName || "bg-primary"
        )}
        style={{ width: `${value || 0}%` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
