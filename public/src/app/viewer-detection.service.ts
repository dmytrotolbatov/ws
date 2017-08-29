import {Injectable, EventEmitter} from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class ViewerDetectionService {
  onConnectionReady: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor() {
  }

  private subject: Rx.Subject<MessageEvent>;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      if (!this.subject.hasError) {
        console.log("Successfully connected to " + url, this.subject);
      }
      this.onConnectionReady.next(true);
    }
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      });

    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return Rx.Subject.create(observer, observable);
  }
}