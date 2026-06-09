import { Suspense } from "react";
import AuthClient from "../auth/AuthClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthClient initialMode="login" />
    </Suspense>
  );
}