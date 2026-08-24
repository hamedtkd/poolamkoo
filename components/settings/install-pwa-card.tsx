"use client";

import { useEffect, useState } from "react";
import { RiInstallLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installPwa() {
    if (!installPrompt) {
      setMessage("از منوی مرورگر «Add to Home Screen / Install app» را بزن.");
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><div className="flex items-center gap-2 type-strong"><RiInstallLine className="text-primary" /> نصب PWA</div><p className="mt-1 type-body text-muted-foreground">پولم‌کو را روی Home Screen نصب کن تا مثل اپ مستقل اجرا شود.</p>{message && <p className="mt-2 text-xs type-strong text-primary">{message}</p>}</div>
        <Button variant="outline" onClick={() => void installPwa()}>نصب روی دستگاه</Button>
      </CardContent>
    </Card>
  );
}
