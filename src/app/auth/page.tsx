import { Suspense } from "react";
import AuthClient from "./AuthClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthClient />
    </Suspense>
  );
}