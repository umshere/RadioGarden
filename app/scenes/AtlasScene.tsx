import { Link } from "@remix-run/react";
import { Badge, Button, Text, Title } from "@mantine/core";
import { useRadioPlayer } from "~/hooks/useRadioPlayer";

type AtlasSceneProps = {
  title?: string;
  description?: string;
};

export default function AtlasScene({
  title = "World Listening Atlas",
  description = "Discover immersive soundscapes and keep your music playing while you explore.",
}: AtlasSceneProps) {
  const player = useRadioPlayer();

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center text-slate-100"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(16, 68, 99, 0.55), transparent 55%), radial-gradient(circle at bottom right, rgba(201, 93, 108, 0.4), transparent 60%), #010d1f",
      }}
    >
      <div className="max-w-3xl space-y-6">
        <Badge radius="xl" size="lg" variant="light" color="ocean.4">
          Welcome to the World view
        </Badge>
        <Title order={1} className="text-4xl font-semibold leading-tight text-slate-100">
          {title}
        </Title>
        <Text size="lg" c="rgba(226, 239, 245, 0.78)">
          {description}
        </Text>
      </div>

      <div className="glass-veil w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-2xl">
        <Title order={3} className="text-xl font-semibold text-slate-100">
          {player.nowPlaying ? "Now playing" : "Queue your first station"}
        </Title>
        {player.nowPlaying ? (
          <div className="mt-4 space-y-2">
            <Text size="lg" className="font-medium text-slate-100">
              {player.nowPlaying.name}
            </Text>
            <Text size="sm" c="rgba(226, 239, 245, 0.65)">
              Broadcasting from {player.nowPlaying.country}
            </Text>
            <Text size="xs" c="rgba(226, 239, 245, 0.45)">
              Playback persists even when you travel between Local and World scenes.
            </Text>
          </div>
        ) : (
          <Text size="sm" c="rgba(226, 239, 245, 0.65)" className="mt-3">
            Pick a station from the Local experience and return here—your player will keep running while you
            explore the globe.
          </Text>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button component={Link} to="/" radius="xl" size="md" variant="gradient" gradient={{ from: "ocean.5", to: "ocean.8" }}>
            Go to Local experience
          </Button>
          {player.nowPlaying && (
            <Button
              variant="outline"
              radius="xl"
              size="md"
              color="ocean.2"
              onClick={player.playPause}
            >
              {player.isPlaying ? "Pause playback" : "Resume playback"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
