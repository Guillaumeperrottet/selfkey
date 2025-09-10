"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestAuth() {
  const [testResult, setTestResult] = useState("");

  const testChangePassword = async () => {
    try {
      console.log("🔄 Test de l'endpoint...");

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour les cookies
        body: JSON.stringify({
          currentPassword: "test123",
          newPassword: "newtest123",
        }),
      });

      console.log("📡 Status:", response.status);
      console.log(
        "📡 Headers:",
        Object.fromEntries(response.headers.entries())
      );

      const text = await response.text();
      console.log("📡 Response:", text);

      setTestResult(`Status: ${response.status}, Response: ${text}`);
    } catch (error) {
      console.error("💥 Erreur:", error);
      setTestResult(`Erreur: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Test Auth Endpoint</h3>
      <Button onClick={testChangePassword} className="mb-4">
        Tester l&apos;endpoint
      </Button>
      {testResult && (
        <div className="p-2 bg-white border rounded text-sm">
          <pre>{testResult}</pre>
        </div>
      )}
    </div>
  );
}
