
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useBackground } from "@/components/BackgroundSystem/BackgroundContext";

const glassVariants = {
  timeOfDay: {
    morning: "bg-[#FFF6E0]/10 border-[#FFD59E]/20 shadow-[#FFD59E]/5",
    afternoon: "bg-[#E0F7FF]/10 border-[#91DEFF]/20 shadow-[#91DEFF]/5",
    evening: "bg-[#FFE8D6]/10 border-[#FFB088]/20 shadow-[#FFB088]/5",
    night: "bg-[#1F2033]/30 border-[#111122]/20 shadow-[#111122]/5",
  },
  cuisineType: {
    italian: "hover:border-[#7D916C]/30",
    japanese: "hover:border-[#264653]/30",
    mexican: "hover:border-[#E07A5F]/30",
    nordic: "hover:border-[#D6CFC7]/30",
    default: "hover:border-teal/30",
  }
};

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Card>
>(({ className, ...props }, ref) => {
  const { timeOfDay, cuisineType } = useBackground();
  
  return (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-300 backdrop-blur-md border shadow-lg",
        "hover:shadow-xl hover:scale-[1.01]",
        glassVariants.timeOfDay[timeOfDay],
        glassVariants.cuisineType[cuisineType || "default"],
        className
      )}
      {...props}
    />
  );
});
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardHeader>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn("", className)} {...props} />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardTitle>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn("relative isolate", className)}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardDescription>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn("", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardFooter>
>(({ className, ...props }, ref) => (
  <CardFooter ref={ref} className={cn("", className)} {...props} />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardContent,
  GlassCardFooter,
  GlassCardTitle,
  GlassCardDescription,
};
