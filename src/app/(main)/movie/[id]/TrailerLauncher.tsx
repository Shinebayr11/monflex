"use client";
import { useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrailerModal } from "@/components/player/TrailerModal";

export function TrailerLauncher({ youtubeKey }: { youtubeKey: string | null }) {
  const [open, setOpen] = useState(false);
  if (!youtubeKey) return null;
  return (
    <>
      <Button
        size="lg"
        variant="secondary"
        className="gap-2 bg-white/10 hover:bg-white/20 border border-white/10"
        onClick={() => setOpen(true)}
      >
        <Film className="size-4" /> Watch Trailer
      </Button>
      <TrailerModal
        youtubeKey={youtubeKey}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
