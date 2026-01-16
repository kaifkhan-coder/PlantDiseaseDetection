import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { z } from "zod";
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

// --- Types & Schema ---

interface AuthPagesProps {
  onAuthSuccess: (email: string) => void;
}

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthMode = "login" | "signup";

// --- Components ---

export default function AuthPages({ onAuthSuccess }: AuthPagesProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<{
  email?: string;
  password?: string;
  api?: string;
}>({});

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  

  const validate = () => {
    const result = authSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  /* LOGIN LOGIC */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:9000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_email", data.email);
      onAuthSuccess(data.email);
    } catch (err: any) {
      setErrors({ api: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  /* SIGNUP LOGIC */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:9000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Signup successful! Please login.");
      setMode("login");
      setFormData({ email: "", password: "" });
    } catch (err: any) {
      setErrors({ api: err.message || "Signup failed" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setErrors({});
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative perspective-1000">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape className="top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20" delay={0} />
        <FloatingShape className="bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-600/20" delay={2} />
        <FloatingShape className="top-[40%] left-[60%] w-64 h-64 bg-green-400/10" delay={4} />
      </div>

      {/* 3D Card Container */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-md mx-4"
      >
        {/* The Flipping Card Wrapper */}
        <motion.div
          initial={false}
          animate={{ rotateY: mode === "signup" ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full min-h-[550px]"
        >
          {/* FRONT FACE: LOGIN */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <GlassCard>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 shadow-inner shadow-emerald-500/20">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                <p className="text-slate-400 mt-2">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />
                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                />

                {errors.api && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.api}
                  </div>
                )}

                <SubmitButton loading={loading} label="Sign In" />
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </GlassCard>
          </div>

          {/* BACK FACE: SIGNUP */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <GlassCard>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 mb-4 shadow-inner shadow-teal-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Join Us</h2>
                <p className="text-slate-400 mt-2">Start your journey with a free account</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />
                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                />

                {errors.api && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.api}
                  </div>
                )}

                <SubmitButton loading={loading} label="Create Account" />
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-teal-400 font-semibold hover:text-teal-300 transition-colors"
                  >
                    Sign in instead
                  </button>
                </p>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- Subcomponents ---

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
      {children}
    </div>
  );
}

function InputField({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: any; error?: string }) {
  return (
    <div className="space-y-1">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input
          {...props}
          className={`w-full bg-slate-900/50 border ${error ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-emerald-500/50"} rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300`}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 group"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

function FloatingShape({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
      animate={{
        y: [0, -40, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 20, -20, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );
}
