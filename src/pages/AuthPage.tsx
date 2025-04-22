
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to LeaseSense</h1>
        <AuthForm />
      </div>
    </div>
  );
}
