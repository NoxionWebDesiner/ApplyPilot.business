import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, LogIn } from "lucide-react";

interface SignInGateProps {
  title: string;
  subtitle: string;
  onLogin: () => void;
}

export function SignInGate({ title, subtitle, onLogin }: SignInGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-10 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-foreground/[0.06] flex items-center justify-center mx-auto mb-5">
        <Brain className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-2xl font-extrabold font-display text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-7 max-w-sm mx-auto">{subtitle}</p>
      <Button
        data-testid="button-sign-in"
        onClick={onLogin}
        size="lg"
        className="rounded-full h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
      >
        <LogIn className="w-4 h-4 mr-2" /> Sign in to get started
      </Button>
    </motion.div>
  );
}
