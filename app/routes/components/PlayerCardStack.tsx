import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { Text, Title, Button, Badge, ThemeIcon, Avatar, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconBroadcast,
  IconHeadphones,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconWaveSine,
  IconDisc,
  IconLanguage,
  IconMusic,
  IconExternalLink,
  IconHeart,
  IconCompass,
} from "@tabler/icons-react";
import { CountryFlag } from "~/components/CountryFlag";
import type { Station, PlayerCard, ListeningMode } from "~/types/radio";

type PlayerCardStackProps = {
  playerCards: PlayerCard[];
  activeCardIndex: number;
  cardDirection: 1 | -1;
  nowPlaying: Station | null;
  isPlaying: boolean;
  listeningMode: ListeningMode;
  favoriteStationIds: Set<string>;
  countryMap: Map<string, { name: string; iso_3166_1: string; stationcount: number }>;
  hasStationsToCycle: boolean;
  isFetchingExplore: boolean;
  localStationCount: number;
  globalStationCount: number;
  selectedCountry: string | null;
  onCardChange: (direction: 1 | -1) => void;
  onCardJump: (index: number) => void;
  onToggleFavorite: (station: Station) => void;
  onStartStation: (station: Station, options?: { autoPlay?: boolean }) => void;
  onPlayPause: () => void;
  onPlayNext: () => void;
  onSetListeningMode: (mode: ListeningMode) => void;
  onMissionExploreWorld: () => void;
  onMissionStayLocal: () => void;
};

const PLAYER_CARD_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    rotate: direction * 0.8,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    rotate: direction * -0.8,
    scale: 0.95,
  }),
} as const;

const PLAYER_CARD_TRANSITION = {
  duration: 0.35,
  ease: [0.42, 0, 0.58, 1] as const,
};

export function PlayerCardStack({
  playerCards,
  activeCardIndex,
  cardDirection,
  nowPlaying,
  isPlaying,
  listeningMode,
  favoriteStationIds,
  countryMap,
  hasStationsToCycle,
  isFetchingExplore,
  localStationCount,
  globalStationCount,
  selectedCountry,
  onCardChange,
  onCardJump,
  onToggleFavorite,
  onStartStation,
  onPlayPause,
  onPlayNext,
  onSetListeningMode,
  onMissionExploreWorld,
  onMissionStayLocal,
}: PlayerCardStackProps) {
  const cardSwipeHandlers = useSwipeable({
    onSwipedLeft: () => onCardChange(1),
    onSwipedRight: () => onCardChange(-1),
    trackMouse: true,
  });

  const activeCard = playerCards[activeCardIndex] ?? playerCards[0] ?? { type: "mission" };
  const totalCards = playerCards.length;
  const activeStationCard = activeCard.type === "station" ? activeCard.station : null;
  const activeStationIsCurrent = activeStationCard
    ? nowPlaying?.uuid === activeStationCard.uuid
    : false;
  const activeStationIsFavorite = activeStationCard
    ? favoriteStationIds.has(activeStationCard.uuid)
    : false;

  const worldCaption = isFetchingExplore
    ? "Loading global mixtape..."
    : `${globalStationCount.toLocaleString()} stations across the atlas`;
  const localCaption = `${localStationCount.toLocaleString()} stations from ${selectedCountry ?? "this country"}`;

  return (
    <section id="player" className="mt-8">
      <div className="player-stack-shell">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-[#0a1426] via-[#0a1426] to-[#0a1426]/95 pb-4 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <Title order={2} style={{ fontSize: "1.6rem", fontWeight: 600 }}>
              Radio passport player
            </Title>
            <Text size="sm" c="rgba(226,232,240,0.68)">
              Swipe through recently stamped stations and queue your next destination.
            </Text>
          </div>
          <Badge
            radius="xl"
            size="md"
            leftSection={<IconHeadphones size={16} />}
            style={{
              background: "rgba(199,158,73,0.2)",
              border: "1px solid rgba(199,158,73,0.45)",
              color: "#fefae0",
            }}
          >
            {Math.max(totalCards - 1, 0).toLocaleString()} stations in stack
          </Badge>
        </div>

        <div className="player-card-stack mt-6" {...cardSwipeHandlers}>
          <AnimatePresence initial={false} custom={cardDirection} mode="wait">
            <motion.div
              key={
                activeCard.type === "station" ? activeCard.station.uuid : "mission-card"
              }
              custom={cardDirection}
              variants={PLAYER_CARD_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={PLAYER_CARD_TRANSITION}
              className="player-card-layer"
            >
              {activeCard.type === "mission" ? (
                <div className="mission-card">
                  <Badge
                    radius="xl"
                    size="sm"
                    leftSection={<IconCompass size={14} />}
                    style={{
                      background: "rgba(209,73,91,0.16)",
                      border: "1px solid rgba(209,73,91,0.35)",
                      color: "#f4ede0",
                    }}
                  >
                    Sound passport
                  </Badge>
                  <Title
                    order={3}
                    style={{ fontSize: "1.85rem", fontWeight: 700, color: "#fefae0" }}
                  >
                    Where to next?
                  </Title>
                  <Text size="sm" c="rgba(226,232,240,0.7)">
                    Discover cultures through sound. Stamp your passport by exploring the
                    world or diving into local airwaves.
                  </Text>
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-4">
                    <Button
                      data-testid="mission-explore-world"
                      radius="xl"
                      size="md"
                      onClick={() => onMissionExploreWorld()}
                      className="touch-manipulation min-h-[44px]"
                      style={{
                        background:
                          "linear-gradient(120deg, rgba(199,158,73,0.92) 0%, rgba(148,113,51,0.92) 100%)",
                        color: "#0f172a",
                        fontWeight: 700,
                        border: "1px solid rgba(254,250,226,0.6)",
                      }}
                    >
                      Explore the World
                    </Button>
                    <Button
                      data-testid="mission-stay-local"
                      radius="xl"
                      size="md"
                      variant="outline"
                      onClick={() => onMissionStayLocal()}
                      className="touch-manipulation min-h-[44px]"
                      style={{
                        border: "1px solid rgba(148,163,184,0.35)",
                        color: "rgba(248,250,252,0.95)",
                        background: "rgba(10,20,38,0.4)",
                      }}
                    >
                      Stay Local
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="player-card">
                  <div className="player-card__header">
                    <div className="player-card__avatar">
                      {activeStationCard?.favicon ? (
                        <Avatar
                          src={activeStationCard.favicon}
                          size={76}
                          radius="xl"
                          style={{ border: "1px solid rgba(255,255,255,0.16)" }}
                        />
                      ) : (
                        <ThemeIcon
                          size={76}
                          radius="xl"
                          style={{
                            background: "rgba(15,23,42,0.75)",
                            border: "1px solid rgba(148,163,184,0.25)",
                          }}
                        >
                          <IconBroadcast size={32} />
                        </ThemeIcon>
                      )}
                    </div>
                    <div className="player-card__title-block">
                      <div className="player-card__title-row">
                        <Text fw={600} size="lg" c="#f8fafc" lineClamp={1}>
                          {activeStationCard?.name}
                        </Text>
                        {activeStationCard?.bitrate ? (
                          <Badge
                            radius="xl"
                            size="xs"
                            leftSection={<IconWaveSine size={11} />}
                            style={{
                              background: "rgba(92,158,173,0.18)",
                              border: "1px solid rgba(92,158,173,0.35)",
                              color: "#fefae0",
                            }}
                          >
                            {activeStationCard.bitrate} kbps
                          </Badge>
                        ) : activeStationCard?.codec ? (
                          <Badge
                            radius="xl"
                            size="xs"
                            leftSection={<IconWaveSine size={11} />}
                            style={{
                              background: "rgba(92,158,173,0.18)",
                              border: "1px solid rgba(92,158,173,0.35)",
                              color: "#fefae0",
                            }}
                          >
                            {activeStationCard.codec}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="player-card__meta-row">
                        {activeStationCard && (
                          <>
                            <CountryFlag
                              iso={
                                countryMap.get(activeStationCard.country)?.iso_3166_1
                              }
                              title={`${activeStationCard.country} flag`}
                              size={28}
                            />
                            <span>{activeStationCard.country}</span>
                            {activeStationCard.language && (
                              <>
                                <span aria-hidden="true">•</span>
                                <span>{activeStationCard.language}</span>
                              </>
                            )}
                            {activeStationCard.bitrate ? (
                              <>
                                <span aria-hidden="true">•</span>
                                <span>{activeStationCard.bitrate} kbps</span>
                              </>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {activeStationCard?.tags && (
                    <Text
                      size="sm"
                      c="rgba(226,232,240,0.72)"
                      className="player-card__tags"
                    >
                      {activeStationCard.tags}
                    </Text>
                  )}
                  <div className="player-card__badges">
                    {activeStationCard?.codec && (
                      <Badge
                        radius="xl"
                        size="xs"
                        leftSection={<IconDisc size={11} />}
                        style={{
                          background: "rgba(37,99,235,0.12)",
                          border: "1px solid rgba(37,99,235,0.28)",
                          color: "rgba(191,219,254,0.85)",
                        }}
                      >
                        {activeStationCard.codec}
                      </Badge>
                    )}
                    {activeStationCard?.tags && (
                      <Badge
                        radius="xl"
                        size="xs"
                        leftSection={<IconMusic size={11} />}
                        style={{
                          background: "rgba(199,158,73,0.16)",
                          border: "1px solid rgba(199,158,73,0.32)",
                          color: "#fefae0",
                        }}
                      >
                        Passport vibes
                      </Badge>
                    )}
                  </div>
                  <div className="player-card__actions">
                    <div className="flex items-center gap-2">
                      {activeStationCard && (
                        <Tooltip
                          label={
                            activeStationIsFavorite
                              ? "Remove from travel log"
                              : "Add to travel log"
                          }
                          withArrow
                          color="gray"
                        >
                          <ActionIcon
                            size="lg"
                            radius="xl"
                            onClick={() => onToggleFavorite(activeStationCard)}
                            style={{
                              background: activeStationIsFavorite
                                ? "linear-gradient(120deg, rgba(209,73,91,0.9) 0%, rgba(148,34,56,0.9) 100%)"
                                : "rgba(15,23,42,0.7)",
                              border: activeStationIsFavorite
                                ? "1px solid rgba(254,250,226,0.6)"
                                : "1px solid rgba(148,163,184,0.25)",
                              color: activeStationIsFavorite
                                ? "#fef3f2"
                                : "rgba(248,250,252,0.85)",
                            }}
                          >
                            <IconHeart
                              size={18}
                              fill={activeStationIsFavorite ? "currentColor" : "none"}
                            />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {activeStationCard && (
                        <Tooltip label="Open stream" withArrow color="gray">
                          <ActionIcon
                            component="a"
                            href={activeStationCard.url}
                            target="_blank"
                            rel="noreferrer"
                            size="lg"
                            radius="xl"
                            style={{
                              background: "rgba(15,23,42,0.7)",
                              border: "1px solid rgba(148,163,184,0.25)",
                              color: "rgba(248,250,252,0.85)",
                            }}
                          >
                            <IconExternalLink size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeStationCard && (
                        <Button
                          radius="xl"
                          size="sm"
                          leftSection={
                            activeStationIsCurrent && isPlaying ? (
                              <IconPlayerPauseFilled size={16} />
                            ) : (
                              <IconPlayerPlayFilled size={16} />
                            )
                          }
                          onClick={() => {
                            if (!activeStationCard) return;
                            if (activeStationIsCurrent) {
                              if (isPlaying) {
                                onPlayPause();
                              } else {
                                onStartStation(activeStationCard, { autoPlay: true });
                              }
                            } else {
                              onStartStation(activeStationCard, { autoPlay: true });
                            }
                          }}
                          className="touch-manipulation min-h-[44px]"
                          style={{
                            background:
                              "linear-gradient(120deg, rgba(199,158,73,0.92) 0%, rgba(148,113,51,0.92) 100%)",
                            color: "#0f172a",
                            fontWeight: 600,
                            border: "1px solid rgba(254,250,226,0.6)",
                          }}
                        >
                          {activeStationIsCurrent
                            ? isPlaying
                              ? "Pause"
                              : "Resume"
                            : "Play now"}
                        </Button>
                      )}
                      <Button
                        radius="xl"
                        variant="outline"
                        size="sm"
                        rightSection={<IconPlayerTrackNext size={16} />}
                        onClick={onPlayNext}
                        disabled={!hasStationsToCycle}
                        className="touch-manipulation min-h-[44px]"
                        style={{
                          border: "1px solid rgba(148,163,184,0.35)",
                          color: "rgba(248,250,252,0.85)",
                          background: "rgba(10,20,38,0.4)",
                          opacity: hasStationsToCycle ? 1 : 0.4,
                        }}
                      >
                        Next destination
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="player-card-controls">
          <div className="player-card-dots" role="tablist" aria-label="Player cards">
            {playerCards.map((card, index) => {
              const isActive = index === activeCardIndex;
              const key =
                card.type === "station"
                  ? `card-${card.station.uuid}`
                  : `mission-${index}`;
              return (
                <button
                  key={key}
                  type="button"
                  className={`player-card-dot ${
                    isActive ? "player-card-dot--active" : ""
                  }`}
                  onClick={() => onCardJump(index)}
                  aria-pressed={isActive}
                  aria-label={
                    card.type === "station"
                      ? `Station ${card.station.name}`
                      : "Mission card"
                  }
                  disabled={totalCards <= 1}
                />
              );
            })}
          </div>
          {totalCards > 1 && (
            <div className="flex items-center gap-3">
              <Button
                radius="xl"
                variant="subtle"
                size="sm"
                leftSection={<IconPlayerTrackPrev size={16} />}
                onClick={() => onCardChange(-1)}
                style={{
                  color: "#fefae0",
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(148,163,184,0.25)",
                }}
              >
                Previous
              </Button>
              <Button
                radius="xl"
                variant="subtle"
                size="sm"
                rightSection={<IconPlayerTrackNext size={16} />}
                onClick={() => onCardChange(1)}
                style={{
                  color: "#fefae0",
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(148,163,184,0.25)",
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
