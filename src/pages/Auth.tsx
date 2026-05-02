import { Shield, Sparkles, Zap, Lock, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"form" | "otp" | "forgot">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>?/gm, '').trim();
  };

  const validatePassword = (pass: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  const validateEmail = (mail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const safeEmail = sanitizeInput(email);
    const safePassword = sanitizeInput(password);

    if (!validateEmail(safeEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (step === "forgot") {
      setSuccessMsg(`Password reset instructions sent to ${safeEmail}`);
      setStep("form");
      return;
    }

    if (!isLogin && !validatePassword(safePassword)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (!safePassword) {
      setError("Password is required.");
      return;
    }

    if (!isLogin && step === "form") {
      // Move to OTP step on sign up
      setStep("otp");
      setSuccessMsg("PROTOTYPE MODE: Use OTP 123456 to verify your account.");
      return;
    }

    if (step === "otp") {
      if (otp !== "123456") {
        setError("Invalid OTP. For this prototype, please use 123456.");
        return;
      }
      // Simulate successful sign up & login
      console.log("Verified OTP:", otp);
      login(safeEmail);
      navigate("/");
      return;
    }

    // Login path
    if (isLogin) {
      console.log("Logging in:", safeEmail);
      login(safeEmail);
      navigate("/");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
           <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-sans tracking-tight text-white mb-4">Unlock Pro Threat Intelligence</h1>
        <p className="text-zinc-400 font-mono text-sm max-w-lg mx-auto">Sign in or create an account to get full access to real-time enterprise feeds, unlimited AI analysis, and historical attack data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
         <div className="card p-8 flex flex-col relative overflow-hidden">
            
            <h2 className="text-xl font-bold text-white mb-6 font-sans">
               {step === "otp" ? 'Verify Account' : step === "forgot" ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-900/50 rounded-lg text-green-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
               {step !== "otp" && (
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2 block">Email Address</label>
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="analyst@soc.com" 
                     className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono" 
                   />
                 </div>
               )}
               
               {step === "form" && (
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2 block">Password</label>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" 
                     className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono" 
                   />
                 </div>
               )}

               {step === "otp" && (
                 <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                   <p className="text-sm text-zinc-400 mb-4">We've sent a 6-digit confirmation code to <strong className="text-white">{email}</strong>. Please enter it below.</p>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2 block">One-Time Password</label>
                   <input 
                     type="text" 
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                     placeholder="000000" 
                     className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-lg px-4 py-3 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:border-cyan-500 font-mono" 
                   />
                 </div>
               )}

               <div className="mt-auto pt-6 flex flex-col gap-4">
                 <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2">
                   {step === "otp" ? 'Verify & Continue' : step === "forgot" ? 'Send Instructions' : isLogin ? 'Authenticate' : 'Sign Up'}
                   {(step === "otp" || !isLogin) && step !== "forgot" && <ArrowRight className="w-4 h-4" />}
                 </button>
                 
                 <div className="flex flex-col gap-2">
                   {step === "form" && (
                     <>
                       <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }} className="text-xs text-zinc-500 hover:text-white transition-colors font-mono uppercase tracking-widest">
                         {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                       </button>
                       {isLogin && (
                         <button type="button" onClick={() => { setStep("forgot"); setError(null); setSuccessMsg(null); }} className="text-xs text-cyan-500/70 hover:text-cyan-400 transition-colors font-mono">
                           Forgot your password?
                         </button>
                       )}
                     </>
                   )}
                   
                   {(step === "otp" || step === "forgot") && (
                     <button type="button" onClick={() => { setStep("form"); setError(null); setSuccessMsg(null); }} className="text-xs text-zinc-500 hover:text-white transition-colors font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                       <ArrowLeft className="w-3 h-3" /> Back to {isLogin ? 'Sign In' : 'Sign Up'}
                     </button>
                   )}
                 </div>
               </div>
            </form>
         </div>

         <div className="flex flex-col gap-4">
             <div className="card p-6 border-cyan-900/50 bg-gradient-to-br from-[#161618] to-cyan-950/20">
                <div className="flex items-start gap-4">
                   <div className="mt-1"><Sparkles className="w-5 h-5 text-cyan-400" /></div>
                   <div>
                     <h3 className="text-sm font-semibold text-white mb-1">Unlimited AI Analyst</h3>
                     <p className="text-xs text-zinc-400 leading-relaxed">Remove the daily quota for unstructured intel extraction and let the neural engine run seamlessly.</p>
                   </div>
                </div>
             </div>

             <div className="card p-6 border-blue-900/50 bg-gradient-to-br from-[#161618] to-blue-950/20">
                <div className="flex items-start gap-4">
                   <div className="mt-1"><Zap className="w-5 h-5 text-blue-400" /></div>
                   <div>
                     <h3 className="text-sm font-semibold text-white mb-1">Real-time Global Sync</h3>
                     <p className="text-xs text-zinc-400 leading-relaxed">Connect directly to 40+ global threat intel exchange endpoints via the live threat map.</p>
                   </div>
                </div>
             </div>

             <div className="card p-6 border-purple-900/50 bg-gradient-to-br from-[#161618] to-purple-950/20">
                <div className="flex items-start gap-4">
                   <div className="mt-1"><Lock className="w-5 h-5 text-purple-400" /></div>
                   <div>
                     <h3 className="text-sm font-semibold text-white mb-1">API Access</h3>
                     <p className="text-xs text-zinc-400 leading-relaxed">Generate your own API keys to automate your SIEM and SOAR playbooks.</p>
                   </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
