import { Suspense } from "react";
import AuthClient from "../auth/AuthClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthClient initialMode="register" />
    </Suspense>
  );
}