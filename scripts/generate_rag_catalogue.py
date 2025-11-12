#!/usr/bin/env python3
"""
Generate comprehensive radio station catalogue for LLM RAG from RadioBrowser API.

This script fetches all available radio stations from RadioBrowser API and formats
them into rich text documents suitable for vector databases and LLM retrieval.
"""

import json
import os
import sys
import time
from typing import List, Dict, Any, Optional
import requests
from datetime import datetime

# RadioBrowser API mirrors (same as the app uses)
MIRRORS = [
    "https://de2.api.radio-browser.info",
    "https://fi1.api.radio-browser.info",
    "https://de1.api.radio-browser.info",
    "https://fr1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://gb1.api.radio-browser.info",
    "https://us1.api.radio-browser.info",
]

DEFAULT_BATCH_SIZE = 10000
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30

class RadioBrowserCatalogueGenerator:
    def __init__(self, output_dir: str = "data"):
        self.output_dir = output_dir
        self.base_url = None
        os.makedirs(output_dir, exist_ok=True)

    def find_working_mirror(self) -> Optional[str]:
        """Find a working RadioBrowser mirror."""
        for mirror in MIRRORS:
            try:
                # Test with a simple request
                response = requests.get(f"{mirror}/json/countries", timeout=10)
                if response.status_code == 200:
                    print(f"✓ Using mirror: {mirror}")
                    return mirror
            except Exception as e:
                print(f"✗ Mirror {mirror} failed: {e}")
                continue
        return None

    def fetch_with_retry(self, url: str, retries: int = MAX_RETRIES) -> Optional[requests.Response]:
        """Fetch URL with retry logic."""
        for attempt in range(retries):
            try:
                response = requests.get(url, timeout=REQUEST_TIMEOUT)
                response.raise_for_status()
                return response
            except Exception as e:
                if attempt < retries - 1:
                    print(f"Attempt {attempt + 1} failed, retrying: {e}")
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"Final attempt failed: {e}")
        return None

    def fetch_all_stations(self, batch_size: int = DEFAULT_BATCH_SIZE) -> List[Dict[str, Any]]:
        """Fetch all stations from RadioBrowser API."""
        if not self.base_url:
            self.base_url = self.find_working_mirror()
            if not self.base_url:
                raise Exception("No working RadioBrowser mirror found")

        all_stations = []
        offset = 0
        total_fetched = 0

        print("Fetching stations from RadioBrowser API...")

        while True:
            url = f"{self.base_url}/json/stations/search?limit={batch_size}&offset={offset}&hidebroken=true&has_geo_info=true"
            print(f"Fetching batch: offset={offset}, limit={batch_size}")

            response = self.fetch_with_retry(url)
            if not response:
                break

            try:
                stations = response.json()
                if not isinstance(stations, list) or len(stations) == 0:
                    break

                all_stations.extend(stations)
                total_fetched += len(stations)
                print(f"✓ Fetched {len(stations)} stations (total: {total_fetched})")

                # If we got fewer than requested, we've reached the end
                if len(stations) < batch_size:
                    break

                offset += batch_size

                # Small delay to be respectful to the API
                time.sleep(0.5)

            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {e}")
                break

        print(f"✓ Total stations fetched: {len(all_stations)}")
        return all_stations

    def format_station_for_rag(self, station: Dict[str, Any]) -> Dict[str, Any]:
        """Format a station into RAG-optimized document."""
        name = station.get('name', '').strip()
        country = station.get('country', '').strip()
        language = station.get('language', '').strip()
        tags = station.get('tags', '').strip()
        state = station.get('state', '').strip()
        homepage = station.get('homepage', '').strip()
        bitrate = station.get('bitrate', 0)
        codec = station.get('codec', '').strip()
        clickcount = station.get('clickcount', 0)
        votes = station.get('votes', 0)

        # Create rich text description
        description_parts = []

        if name:
            description_parts.append(f"Radio station: {name}")

        if country:
            location = country
            if state:
                location = f"{state}, {country}"
            description_parts.append(f"Location: {location}")

        if language:
            description_parts.append(f"Language: {language}")

        if tags:
            # Clean up tags
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            if tag_list:
                description_parts.append(f"Genres: {', '.join(tag_list[:5])}")  # Limit to top 5 tags

        if bitrate and bitrate > 0:
            quality = "high quality" if bitrate >= 128 else "standard quality" if bitrate >= 64 else "low quality"
            description_parts.append(f"Audio: {bitrate}kbps {codec} ({quality})")

        if clickcount and clickcount > 0:
            popularity = "very popular" if clickcount > 10000 else "popular" if clickcount > 1000 else "moderately popular"
            description_parts.append(f"Popularity: {clickcount:,} listeners ({popularity})")

        if homepage:
            description_parts.append(f"Website: {homepage}")

        # Create searchable text content
        content = ". ".join(description_parts)
        if not content.endswith('.'):
            content += '.'

        # Create metadata for filtering
        metadata = {
            'uuid': station.get('stationuuid', station.get('uuid', '')),
            'name': name,
            'country': country,
            'language': language,
            'tags': tags,
            'state': state,
            'bitrate': bitrate,
            'codec': codec,
            'clickcount': clickcount,
            'votes': votes,
            'homepage': homepage,
            'stream_url': station.get('url_resolved', station.get('url', '')),
            'favicon': station.get('favicon', ''),
        }

        return {
            'id': metadata['uuid'],
            'content': content,
            'metadata': metadata
        }

    def generate_catalogue(self, stations: List[Dict[str, Any]], output_format: str = 'jsonl') -> str:
        """Generate the complete RAG catalogue."""
        timestamp = datetime.now().isoformat()
        output_file = os.path.join(self.output_dir, f"radiobrowser_catalogue_{timestamp.replace(':', '-')}.{output_format}")

        formatted_stations = []
        print(f"Formatting {len(stations)} stations for RAG...")

        for i, station in enumerate(stations):
            if i % 1000 == 0:
                print(f"Processed {i}/{len(stations)} stations")

            formatted = self.format_station_for_rag(station)
            if formatted['content']:  # Only include stations with content
                formatted_stations.append(formatted)

        print(f"✓ Formatted {len(formatted_stations)} stations successfully")

        # Write to file
        if output_format == 'jsonl':
            with open(output_file, 'w', encoding='utf-8') as f:
                for station in formatted_stations:
                    f.write(json.dumps(station, ensure_ascii=False) + '\n')
        elif output_format == 'json':
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'metadata': {
                        'generated_at': timestamp,
                        'total_stations': len(formatted_stations),
                        'source': 'RadioBrowser API',
                        'format_version': '1.0'
                    },
                    'stations': formatted_stations
                }, f, indent=2, ensure_ascii=False)

        print(f"✓ Catalogue saved to: {output_file}")
        return output_file

    def generate_statistics(self, stations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate statistics about the catalogue."""
        stats = {
            'total_stations': len(stations),
            'countries': {},
            'languages': {},
            'tags': {},
            'bitrate_distribution': {},
            'codec_distribution': {}
        }

        for station in stations:
            # Country stats
            country = station.get('country', 'Unknown')
            stats['countries'][country] = stats['countries'].get(country, 0) + 1

            # Language stats
            language = station.get('language', 'Unknown')
            stats['languages'][language] = stats['languages'].get(language, 0) + 1

            # Tag stats
            tags = station.get('tags', '')
            if tags:
                for tag in tags.split(','):
                    tag = tag.strip().lower()
                    if tag:
                        stats['tags'][tag] = stats['tags'].get(tag, 0) + 1

            # Bitrate distribution
            bitrate = station.get('bitrate', 0)
            if bitrate:
                range_key = f"{(bitrate // 32) * 32}-{(bitrate // 32) * 32 + 31}"
                stats['bitrate_distribution'][range_key] = stats['bitrate_distribution'].get(range_key, 0) + 1

            # Codec stats
            codec = station.get('codec', 'Unknown')
            stats['codec_distribution'][codec] = stats['codec_distribution'].get(codec, 0) + 1

        # Sort and limit top items
        stats['top_countries'] = dict(sorted(stats['countries'].items(), key=lambda x: x[1], reverse=True)[:20])
        stats['top_languages'] = dict(sorted(stats['languages'].items(), key=lambda x: x[1], reverse=True)[:20])
        stats['top_tags'] = dict(sorted(stats['tags'].items(), key=lambda x: x[1], reverse=True)[:50])

        return stats

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate RadioBrowser catalogue for LLM RAG")
    parser.add_argument('--output-dir', default='data', help='Output directory')
    parser.add_argument('--format', choices=['json', 'jsonl'], default='jsonl', help='Output format')
    parser.add_argument('--batch-size', type=int, default=DEFAULT_BATCH_SIZE, help='Batch size for API requests')
    parser.add_argument('--stats-only', action='store_true', help='Only generate statistics, not full catalogue')

    args = parser.parse_args()

    generator = RadioBrowserCatalogueGenerator(args.output_dir)

    try:
        print("🚀 Starting RadioBrowser catalogue generation...")

        # Fetch all stations
        stations = generator.fetch_all_stations(args.batch_size)

        if not stations:
            print("❌ No stations fetched")
            sys.exit(1)

        # Generate statistics
        stats = generator.generate_statistics(stations)
        stats_file = os.path.join(args.output_dir, f"catalogue_stats_{datetime.now().isoformat().replace(':', '-')}.json")
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        print(f"✓ Statistics saved to: {stats_file}")

        # Print summary
        print(f"\n📊 Catalogue Summary:")
        print(f"   Total stations: {stats['total_stations']}")
        print(f"   Countries: {len(stats['countries'])}")
        print(f"   Languages: {len(stats['languages'])}")
        print(f"   Tags: {len(stats['tags'])}")

        if not args.stats_only:
            # Generate full catalogue
            output_file = generator.generate_catalogue(stations, args.format)
            print(f"\n✅ Catalogue generation complete!")
            print(f"   Output: {output_file}")
        else:
            print("\n✅ Statistics generation complete!")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
