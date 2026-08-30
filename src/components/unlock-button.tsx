import { toast } from "sonner";
import { useCheckout } from "@/lib/radar/hooks";
import { Button } from "./ui/button";

export function UnlockButton({
  label = "Unlock $5",
  variant = "default",
  size = "default",
  className,
}: {
  label?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const checkout = useCheckout();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={checkout.isPending}
      onClick={() => {
        checkout.mutate(undefined, {
          onSuccess: (res) => {
            if (res.ok && "url" in res && res.url) {
              window.open(res.url, "_blank", "noopener,noreferrer");
              return;
            }
            if (res.ok && "unlocked" in res && res.unlocked) {
              toast.success("Desk unlocked");
              return;
            }
            if (!res.ok) toast.error(res.error);
          },
          onError: (err) => toast.error(err.message),
        });
      }}
    >
      {checkout.isPending ? "Opening checkout" : label}
    </Button>
  );
}
