import { Container, Title, Text, Group, Button, Stack, Card, SimpleGrid, ThemeIcon } from "@mantine/core";
import { Link } from "@remix-run/react";
import {
    IconRadio,
    IconGlobe,
    IconMicrophone,
    IconHeadphones,
    IconBroadcast,
    IconArrowRight,
} from "@tabler/icons-react";

export const meta = () => [
    { title: "About Radio Passport | Discover Global Radio" },
    { name: "description", content: "Explore the world's radio stations with an elegant, minimal interface." },
];

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 lg:py-20">
            <Container size="lg">
                {/* Hero Section */}
                <Stack gap="xl" align="center" mb={60}>
                    <div className="text-center">
                        <Title
                            order={1}
                            className="text-4xl lg:text-6xl font-bold text-slate-900 mb-4"
                            style={{ lineHeight: 1.2 }}
                        >
                            Explore the World's Radio
                        </Title>
                        <Text
                            size="lg"
                            c="dimmed"
                            className="text-slate-600 max-w-2xl mx-auto"
                        >
                            Radio Passport brings the world's radio stations to your fingertips with an elegant,
                            intuitive interface. Discover new voices, music, and cultures from across the globe.
                        </Text>
                    </div>
                </Stack>

                {/* Vision Statement */}
                <Card
                    withBorder
                    radius="xl"
                    p="xl"
                    mb={60}
                    className="border-slate-200 bg-white/50 backdrop-blur-sm"
                >
                    <Stack gap="md">
                        <div>
                            <Title order={2} className="text-2xl font-bold text-slate-900 mb-3">
                                Our Vision
                            </Title>
                            <Text size="md" c="dimmed" className="text-slate-700 leading-relaxed">
                                We believe radio is a timeless medium that connects people across borders.
                                Our mission is to democratize access to global radio by building a beautiful,
                                AI-enhanced discovery platform that celebrates the diversity of voices and
                                perspectives from every corner of the world.
                            </Text>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <Text size="md" c="dimmed" className="text-slate-700 leading-relaxed italic">
                                "From local community stations to international broadcasters, Radio Passport
                                transforms how you discover, explore, and connect with the world through radio."
                            </Text>
                        </div>
                    </Stack>
                </Card>

                {/* Core Features */}
                <div className="mb-60">
                    <Title order={2} className="text-3xl font-bold text-slate-900 mb-8 text-center">
                        What Makes Us Different
                    </Title>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                        <FeatureCard
                            icon={<IconGlobe size={24} />}
                            title="Global Coverage"
                            description="Access over 40,000 radio stations from 200+ countries and territories."
                        />
                        <FeatureCard
                            icon={<IconMicrophone size={24} />}
                            title="AI-Powered Discovery"
                            description="Intelligent recommendations powered by Gemini AI help you discover stations matched to your interests."
                        />
                        <FeatureCard
                            icon={<IconHeadphones size={24} />}
                            title="Minimal Interface"
                            description="Clean, light-first aesthetic designed for distraction-free listening and exploration."
                        />
                        <FeatureCard
                            icon={<IconRadio size={24} />}
                            title="Real-Time Streaming"
                            description="Seamless audio streaming with robust error handling and fallback mechanisms."
                        />
                        <FeatureCard
                            icon={<IconBroadcast size={24} />}
                            title="Curated Collections"
                            description="Explore hand-picked station collections organized by genre, language, and region."
                        />
                        <FeatureCard
                            icon={<IconHeadphones size={24} />}
                            title="Cross-Device Sync"
                            description="Continue listening across desktop and mobile with synchronized playback history."
                        />
                    </SimpleGrid>
                </div>

                {/* Tech Stack */}
                <Card
                    withBorder
                    radius="xl"
                    p="xl"
                    mb={60}
                    className="border-slate-200 bg-white/50 backdrop-blur-sm"
                >
                    <Stack gap="md">
                        <Title order={2} className="text-2xl font-bold text-slate-900">
                            Built With Modern Tech
                        </Title>
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                            <TechBadge name="React" />
                            <TechBadge name="Remix" />
                            <TechBadge name="TypeScript" />
                            <TechBadge name="Tailwind CSS" />
                            <TechBadge name="Mantine UI" />
                            <TechBadge name="Framer Motion" />
                            <TechBadge name="Zustand" />
                            <TechBadge name="Gemini AI" />
                        </SimpleGrid>
                    </Stack>
                </Card>

                {/* CTA Section */}
                <Stack gap="md" align="center" mb={40}>
                    <Title order={2} className="text-2xl font-bold text-slate-900 text-center">
                        Ready to Explore?
                    </Title>
                    <Link to="/">
                        <Button
                            size="lg"
                            radius="xl"
                            className="bg-slate-900 hover:bg-slate-800 text-white"
                            rightSection={<IconArrowRight size={20} />}
                        >
                            Start Discovering
                        </Button>
                    </Link>
                </Stack>

                {/* Footer Info */}
                <div className="text-center pt-12 border-t border-slate-200">
                    <Text size="sm" c="dimmed" className="text-slate-600">
                        Radio Passport © 2024–2025. Built with ❤️ for radio enthusiasts everywhere.
                    </Text>
                </div>
            </Container>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card
            withBorder
            radius="xl"
            p="md"
            className="border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors"
        >
            <Group mb="xs">
                <ThemeIcon
                    size="lg"
                    radius="md"
                    variant="light"
                    className="bg-slate-100 text-slate-700"
                >
                    {icon}
                </ThemeIcon>
            </Group>
            <Text fw={600} size="md" className="text-slate-900 mb-2">
                {title}
            </Text>
            <Text size="sm" c="dimmed" className="text-slate-600">
                {description}
            </Text>
        </Card>
    );
}

function TechBadge({ name }: { name: string }) {
    return (
        <div className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium text-center">
            {name}
        </div>
    );
}
