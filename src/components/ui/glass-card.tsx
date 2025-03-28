import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useBackground } from "@/components/BackgroundSystem/BackgroundContext";
import { TextureOverlay } from "@/components/BackgroundSystem/TextureOverlay";

interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  interactive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  accentPosition?: 'top' | 'left' | 'bottom' | 'right' | 'none';
}

const glassVariants = {
  timeOfDay: {
    morning: "bg-[#FFF6E0]/10 border-[#FFD59E]/20 shadow-[#FFD59E]/5",
    afternoon: "bg-[#E0F7FF]/10 border-[#91DEFF]/20 shadow-[#91DEFF]/5",
    evening: "bg-[#FFE8D6]/10 border-[#FFB088]/20 shadow-[#FFB088]/5",
    night: "bg-[#1F2033]/30 border-[#111122]/20 shadow-[#111122]/5",
  },
  cuisineType: {
    italian: "hover:border-[#7D916C]/40 data-[state=active]:border-[#7D916C]/50",
    japanese: "hover:border-[#264653]/40 data-[state=active]:border-[#264653]/50",
    mexican: "hover:border-[#E07A5F]/40 data-[state=active]:border-[#E07A5F]/50",
    nordic: "hover:border-[#D6CFC7]/40 data-[state=active]:border-[#D6CFC7]/50",
    default: "hover:border-teal/40 data-[state=active]:border-teal/50",
  },
  intensity: {
    low: "backdrop-blur-sm bg-opacity-5",
    medium: "backdrop-blur-md bg-opacity-10",
    high: "backdrop-blur-lg bg-opacity-15",
  },
  accentPosition: {
    top: "before:top-0 before:left-0 before:right-0 before:h-1",
    left: "before:left-0 before:top-0 before:bottom-0 before:w-1",
    bottom: "before:bottom-0 before:left-0 before:right-0 before:h-1",
    right: "before:right-0 before:top-0 before:bottom-0 before:w-1",
    none: "before:hidden",
  },
  interactive: {
    true: "cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] active:shadow-sm",
    false: "transition-all duration-300",
  }
};

const cuisineTextures: Record<string, "medium" | "fine" | "coarse" | "paper" | "fabric" | "brushstroke" | "food"> = {
  italian: "medium",
  japanese: "fine",
  mexican: "coarse",
  nordic: "paper",
  default: "fine",
};

const cuisineBlends: Record<string, "overlay" | "soft-light" | "multiply" | "screen"> = {
  italian: "soft-light",
  japanese: "overlay",
  mexican: "soft-light",
  nordic: "multiply",
  default: "soft-light",
};

const GlassCard = React.forwardRef<
  HTMLDivElement,
  GlassCardProps
>(({ className, interactive = true, intensity = 'medium', accentPosition = 'none', ...props }, ref) => {
  const { timeOfDay, cuisineType } = useBackground();
  const [isActive, setIsActive] = React.useState(false);
  
  const handleMouseDown = () => interactive && setIsActive(true);
  const handleMouseUp = () => interactive && setIsActive(false);
  const handleMouseLeave = () => interactive && setIsActive(false);
  
  const textureType = cuisineType ? (cuisineTextures[cuisineType] || cuisineTextures["default"]) : cuisineTextures["default"];
  const blendMode = cuisineType ? (cuisineBlends[cuisineType] || cuisineBlends["default"]) : cuisineBlends["default"];
  
  const accentColors = {
    italian: "from-[#7D916C]/60 via-[#7D916C]/40 to-transparent",
    japanese: "from-[#264653]/60 via-[#264653]/40 to-transparent",
    mexican: "from-[#E07A5F]/60 via-[#E07A5F]/40 to-transparent",
    nordic: "from-[#D6CFC7]/60 via-[#D6CFC7]/40 to-transparent",
    default: "from-teal/60 via-teal/40 to-transparent",
  };
  
  return (
    <Card
      ref={ref}
      data-state={isActive ? "active" : "inactive"}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative backdrop-blur-md border shadow-lg overflow-hidden",
        "before:absolute before:content-[''] before:bg-gradient-to-r",
        "before:z-10 before:transition-opacity before:duration-300",
        "before:opacity-0 hover:before:opacity-100",
        glassVariants.timeOfDay[timeOfDay],
        glassVariants.cuisineType[cuisineType || "default"],
        glassVariants.intensity[intensity],
        glassVariants.accentPosition[accentPosition],
        glassVariants.interactive[String(interactive) as 'true' | 'false'],
        accentPosition !== 'none' && accentColors[cuisineType || "default"],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <TextureOverlay 
          type={textureType} 
          blend={blendMode} 
          opacity={0.08} 
          className="transition-opacity duration-300 group-hover:opacity-[0.12]"
        />
      </div>
      <div className="relative z-10">{props.children}</div>
    </Card>
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
