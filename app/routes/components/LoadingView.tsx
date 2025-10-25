import { motion } from "framer-motion";
import { Title, Text } from "@mantine/core";
import { SkeletonCard, SkeletonGrid } from "./SkeletonCard";
import { BRAND } from "~/constants/brand";

export function LoadingView() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="hero-surface flex flex-col items-center gap-4 px-6 py-12 text-center md:px-10">
        <div className="space-y-2">
          <Title order={2} style={{ color: BRAND.beige }}>
            Retuning the atlas
          </Title>
          <Text size="sm" c="rgba(244,237,224,0.65)">
            Loading stations...
          </Text>
        </div>
      </div>
      
      <SkeletonGrid count={6} />
    </motion.section>
  );
}
