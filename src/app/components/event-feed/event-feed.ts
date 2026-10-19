import { Component, computed, inject, signal } from '@angular/core';
import { EventFeedService, FeedEvent } from '../../services/event-feed-service';

// Live list of the latest backend events (Kafka -> api-gateway -> WebSocket).
@Component({
  selector: 'app-event-feed',
  imports: [],
  templateUrl: './event-feed.html',
  styleUrl: './event-feed.scss',
})
export class EventFeed {
  private feed = inject(EventFeedService);

  // while paused the list shows a frozen copy; new events keep arriving in the service
  protected readonly frozen = signal<FeedEvent[] | null>(null);
  protected readonly paused = computed(() => this.frozen() !== null);
  protected readonly events = computed(() => this.frozen() ?? this.feed.events());

  protected togglePause(): void {
    this.frozen.set(this.paused() ? null : this.feed.events());
  }
}
