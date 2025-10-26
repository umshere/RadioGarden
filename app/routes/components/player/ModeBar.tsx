import { Text, Button, ActionIcon, Tooltip } from "@mantine/core";
import { motion } from "framer-motion";
import { IconMapPin, IconArrowLeft } from "@tabler/icons-react";
import type { ListeningMode } from "~/types/radio";

type ModeBarProps = {
  listeningMode: ListeningMode;
  onQuickRetune: () => void;
  onBackToWorld: () => void;
};

export function ModeBar({ listeningMode, onQuickRetune, onBackToWorld }: ModeBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/8 bg-white/3 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
          <Text size="xs" c="rgba(244,237,224,0.5)" fw={500} style={{ letterSpacing: "0.5px" }}>
            MODE
          </Text>
          <Text size="xs" c="#fefae0" fw={600}>
            {listeningMode === "world" ? "Explore World" : "Stay Local"}
          </Text>
        </div>
        
        <Tooltip label="Change region" position="top" withArrow>
          <Button
            radius="md"
            size="xs"
            variant="light"
            leftSection={<IconMapPin size={14} />}
            onClick={onQuickRetune}
            style={{
              color: "#0f172a",
              background: "rgba(254,250,226,0.92)",
              border: "1px solid rgba(199,158,73,0.3)",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: "28px",
              padding: "0 10px",
            }}
          >
            Quick retune
          </Button>
        </Tooltip>
      </div>
      
      <Tooltip label="Back to world view" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onBackToWorld}
          style={{ color: "#94a3b8" }}
          aria-label="Back to world view"
        >
          <IconArrowLeft size={16} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
