import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showClickHint?: boolean }
>(({ className, showClickHint = false, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border bg-gradient-to-r from-indigo-200 to-purple-200 shadow-lg transform transition-transform duration-300 ease-in-out hover:rotate-6",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {isHovered && showClickHint && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
          Click it
        </div>
      )}
      {props.children}
    </div>
  );
});
Card.displayName = "Card";

// CardHeader Component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 border-b", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// CardTitle Component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight text-gray-800",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// CardDescription Component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// CardContent Component
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

// CardFooter Component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 border-t", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";



const CardWrapper = ({ children, className }) => {
  return (
    <div className={cn("card-wrapper mx-auto w-full max-w-sm ", className)}>
      {children}
    </div>
  );
};


export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent,CardWrapper};
