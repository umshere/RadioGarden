// TODO: MissionLogDrawer – first stub
import { useState } from "react";
import { Button, Drawer, List, Text } from "@mantine/core";

type Entry = { id: string; label: string };

export default function MissionLogDrawer() {
  const [opened, setOpened] = useState(false);
  const entries: Entry[] = [];
  return (
    <>
      <Button variant="light" onClick={() => setOpened(true)}>Mission Log</Button>
      <Drawer opened={opened} onClose={() => setOpened(false)} title="Mission Log" position="right">
        {entries.length === 0 ? (
          <Text c="dimmed" size="sm">No missions yet. Your future explorations will appear here.</Text>
        ) : (
          <List spacing="xs" size="sm">
            {entries.map((e) => (
              <List.Item key={e.id}>{e.label}</List.Item>
            ))}
          </List>
        )}
      </Drawer>
    </>
  );
}

