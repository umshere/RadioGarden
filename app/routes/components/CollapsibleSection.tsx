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
        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
      >
        <Text fw={700} size="sm" c="slate.9">
          {title}
        </Text>
        <ActionIcon
          radius="xl"
          size="md"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls={`${id ?? title}-content`}
          className="text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900"
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
