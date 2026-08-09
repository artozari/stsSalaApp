import { Injectable } from '@angular/core';
import mqtt, { type MqttClient } from 'mqtt';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private client?: MqttClient;
  private subscribedTopics = new Set<string>();
  private currentTopic = environment.topicStatus;
  private currentTopicGames = environment.topicGames;
  private topicStsMesas = environment.topicStsMesas;

  constructor() {}

  private createClient() {
    if (this.client) {
      if (this.client.connected) {
        this.ensureSubscriptions();
      }
      return;
    }

    this.client = mqtt.connect(environment.mqttUrl, {
      username: environment.mqttUsername,
      password: environment.mqttPassword,
    });

    this.client.on('connect', () => {
      console.log('mqtt connected');
      this.ensureSubscriptions();
    });

    this.client.on('reconnect', () => {
      console.log('mqtt reconnecting...');
    });

    this.client.on('error', (err) => {
      console.error('mqtt error', err);
    });

    this.client.on('close', () => {
      console.log('mqtt connection closed');
    });
  }

  private ensureSubscriptions() {
    if (!this.client?.connected) {
      return;
    }

    const topics = [this.currentTopic, this.currentTopicGames, this.topicStsMesas];
    for (const topic of topics) {
      if (this.subscribedTopics.has(topic)) {
        continue;
      }
      this.subscribedTopics.add(topic);
      this.client.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
          console.error('mqtt subscribe error', topic, err);
          this.subscribedTopics.delete(topic);
        } else {
          console.log('mqtt subscribed to', topic);
        }
      });
    }
  }

  public getSensorUpdates(topicNumber: number | string = 1): Observable<any> {
    this.currentTopic = `${environment.topicStatus}${topicNumber}`;
    this.createClient();
    return new Observable((observer) => {
      const handleMessage = (topic: string, payload: Uint8Array) => {
        if (topic !== this.currentTopic) {
          return;
        }

        const msg = payload.toString();
        let data: unknown = msg;
        try {
          data = JSON.parse(msg);
        } catch {
          /* no hace nada */
        }

        observer.next(data);
      };

      this.client?.on('message', handleMessage);

      return () => {
        this.client?.removeListener('message', handleMessage);
        if (this.client?.connected) {
          this.subscribedTopics.delete(this.currentTopic);
          this.client.unsubscribe(this.currentTopic, (err: Error | undefined) => {
            if (err) {
              console.warn('mqtt unsubscribe error', err);
            }
          });
        }
      };
    });
  }

  public getGameTopics(): Observable<string[]> {
    this.createClient();
    return new Observable<string[]>((observer) => {
      observer.next([]);
      const gamePrefix = environment.topicGames.endsWith('#')
        ? environment.topicGames.slice(0, -1)
        : environment.topicGames;

      const handleMessage = (topic: string) => {
        if (topic.startsWith(gamePrefix)) {
          const parts = topic.split('/');
          if (parts.length >= 3) {
            const directChild = parts[2];
            observer.next([directChild]);
          }
        } else {
          observer.next([]);
        }
      };

      this.client?.on('message', handleMessage);

      return () => {
        this.client?.removeListener('message', handleMessage);
      };
    });
  }

  public getAllDataDashboeard(): Observable<{}> {
    this.createClient();
    return new Observable((observer) => {
      const dashboardPrefix = environment.topicStsMesas.endsWith('#')
        ? environment.topicStsMesas.slice(0, -1)
        : environment.topicStsMesas;

      const handleMessage = (topic: string, payload: Uint8Array) => {
        if (topic.startsWith(dashboardPrefix)) {
          const topicos = topic.split('/');
          if (topicos.length >= 3) {
            const lastSegment = topicos[topicos.length - 1];
            try {
              const payloadData = JSON.parse(payload.toString());
              observer.next({ Mesa: lastSegment, payload: payloadData });
            } catch (err) {
              console.error('Error parsing MQTT message payload:', err);
              observer.error(err);
            }
          }
        }
      };

      this.client?.on('message', handleMessage);

      return () => {
        this.client?.removeListener('message', handleMessage);
      };
    });
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end(true, () => {
        console.log('mqtt client disconnected');
      });
      this.client = undefined;
      this.subscribedTopics.clear();
    }
  }
}
