import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConfirmClient />
    </Suspense>
  );
}