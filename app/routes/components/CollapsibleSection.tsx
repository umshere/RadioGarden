import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionIcon, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
};

export function CollapsibleSection({ title, defaultOpen = true, children, id }: CollapsibleSectionProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <section id={id} className="mt-4">
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2"
        style={{
          borderColor: "rgba(244,237,224,0.12)",
          background: "rgba(4,22,39,0.6)",
        }}
      >
        <Text fw={600} size="sm" c="#f8fafc">
          {title}
        </Text>
        <ActionIcon
          radius="xl"
          size="md"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls={`${id ?? title}-content`}
          style={{ color: "rgba(248,250,252,0.8)", border: "1px solid rgba(148,163,184,0.28)", background: "rgba(12,30,52,0.68)" }}
        >
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18 }}
            style={{ display: "inline-flex" }}
          >
            <IconChevronDown size={16} />
          </motion.span>
        </ActionIcon>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id ?? title}-content`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
