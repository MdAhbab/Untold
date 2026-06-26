import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "../../lib/store";

const Toaster = ({ ...props }: ToasterProps) => {
  // Follow Untold's own theme (the app doesn't use next-themes).
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
