import { AlertCircle, TrendingUp, Shield, Zap } from "lucide-react";

export type Recommendation = "Strong Hire" | "Hire" | "Maybe" | "No Hire";

export const recommendationConfig: Record<
  Recommendation,
  { color: string; dot: string; bar: string; icon: React.ReactNode }
> = {
  "Strong Hire": {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    icon: <Zap className="w-3 h-3" />,
  },
  Hire: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  Maybe: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
    icon: <Shield className="w-3 h-3" />,
  },
  "No Hire": {
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-400",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};
