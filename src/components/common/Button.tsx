import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

/** Shared button with consistent styling and focus ring. */
export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return <button type="button" className={`btn btn--${variant} ${className}`} {...rest} />;
}
