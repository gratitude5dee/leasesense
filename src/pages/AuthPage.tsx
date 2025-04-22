
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Welcome to LeaseSense</h1>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
