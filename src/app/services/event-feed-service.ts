import { inject, Service, signal } from '@angular/core';
import { SettingsService } from './settings-service';

// Kafka topic names as defined in the backend (shared-common KafkaTopics.java).
// The frontend receives these events through api-gateway's STOMP topics.
export const FEED_TOPICS = {
  forkliftLocation: 'forklift.location-updated',
  packageAllocated: 'warehouse.package-allocated',
  packagePicked: 'forklift.package-picked',
  packageStored: 'forklift.package-stored',
  packageDropped: 'forklift.package-dropped',
} as const;

export type FeedTopic = typeof FEED_TOPICS[keyof typeof FEED_TOPICS];

export interface FeedEvent {
  id: number;
  time: string;
  topic: FeedTopic;
  text: string;
}

const MAX_EVENTS = 25;

// Last events of the open layout, newest first.
@Service()
export class EventFeedService {
  private settings = inject(SettingsService);
  private nextId = 1;

  readonly events = signal<FeedEvent[]>([]);

  record(topic: FeedTopic, text: string, timestamp?: string): void {
    if (topic === FEED_TOPICS.forkliftLocation && !this.settings.showForkliftLocationsInFeed()) {
      return;
    }
    const event: FeedEvent = { id: this.nextId++, time: this.formatTime(timestamp), topic, text };
    this.events.update(events => [event, ...events].slice(0, MAX_EVENTS));
  }

  clear(): void {
    this.events.set([]);
  }

  // HH:mm:ss.SSS - milliseconds show how close together the events arrive
  private formatTime(timestamp?: string): string {
    const parsed = timestamp ? new Date(timestamp) : new Date();
    const date = isNaN(parsed.getTime()) ? new Date() : parsed;
    const pad = (value: number, length = 2) => String(value).padStart(length, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  }
}
