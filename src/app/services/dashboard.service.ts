import { Injectable } from '@angular/core';
import mqtt, { type MqttClient } from 'mqtt';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface IDashboardMessage {
  broker: string;
  Mesa: string;
  casinoCode: string;
  casinoName: string;
  payload: any;
}

function getCasinoName(casinoData: unknown): string | undefined {
  if (!Array.isArray(casinoData)) {
    return undefined;
  }
  for (let i = 0; i + 1 < casinoData.length; i += 2) {
    if (String(casinoData[i]).toLowerCase() === 'name') {
      return String(casinoData[i + 1]);
    }
  }
  return undefined;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private client?: MqttClient;
  private dashboardClients: { url: string; client: MqttClient }[] = [];
  private dashboardClientUrls = new Set<string>();
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

  private createExtraDashboardClients() {
    const brokers = environment.mqttBrokers ?? [];
    for (const broker of brokers) {
      if (!broker?.url) {
        continue;
      }
      if (broker.url === environment.mqttUrl) {
        continue;
      }
      if (this.dashboardClientUrls.has(broker.url)) {
        continue;
      }
      this.dashboardClientUrls.add(broker.url);

      const extra = mqtt.connect(broker.url, {
        username: broker.username,
        password: broker.password,
      });

      extra.on('connect', () => {
        console.log('mqtt dashboard connected', broker.url);
        extra.subscribe(this.topicStsMesas, { qos: 0 }, (err) => {
          if (err) {
            console.error('mqtt dashboard subscribe error', broker.url, err);
          } else {
            console.log('mqtt dashboard subscribed', broker.url, this.topicStsMesas);
          }
        });
      });

      extra.on('error', (err) => {
        console.error('mqtt dashboard error', broker.url, err);
      });

      extra.on('close', () => {
        console.log('mqtt dashboard closed', broker.url);
      });

      this.dashboardClients.push({ url: broker.url, client: extra });
    }
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

  public getAllDataDashboeard(): Observable<IDashboardMessage> {
    this.createClient();
    this.createExtraDashboardClients();
    return new Observable((observer) => {
      const dashboardPrefix = environment.topicStsMesas.endsWith('#')
        ? environment.topicStsMesas.slice(0, -1)
        : environment.topicStsMesas;

      const clients = [
        { url: environment.mqttUrl, client: this.client },
        ...this.dashboardClients,
      ].filter((entry) => !!entry.client) as { url: string; client: MqttClient }[];

      const makeHandleMessage = (broker: string) => {
        return (topic: string, payload: Uint8Array) => {
          if (!topic.startsWith(dashboardPrefix)) {
            return;
          }
          const topicos = topic.split('/');
          if (topicos.length < 4) {
            return;
          }
          const shortName = topicos[topicos.length - 1];
          const casinoCode = topicos[3];
          try {
            const payloadData = JSON.parse(payload.toString());
            const casinoName = getCasinoName(payloadData?.casinoData) ?? casinoCode;
            observer.next({ broker, Mesa: shortName, casinoCode, casinoName, payload: payloadData });
          } catch (err) {
            console.error('Error parsing MQTT message payload:', err);
            observer.error(err);
          }
        };
      };

      const handlers = clients.map(({ url, client }) => {
        const handle = makeHandleMessage(url);
        client.on('message', handle);
        return { client, handle };
      });

      return () => {
        handlers.forEach(({ client, handle }) => client.removeListener('message', handle));
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
    this.dashboardClients.forEach(({ client }) => client.end(true, () => {}));
    this.dashboardClients = [];
    this.dashboardClientUrls.clear();
  }
}
