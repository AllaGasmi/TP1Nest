import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APP_EVENTS } from 'src/common/constants/app-events';

@Injectable()
export class CvListener {

  constructor() {
    console.log('🔥 CvListener instantiated');
  }
  @OnEvent(APP_EVENTS.CV_ADD)
  async handleCvAdded(payload: any) {
    console.log('CV ADDED');
    console.log(payload);
  }

  @OnEvent(APP_EVENTS.CV_UPDATE)
  async handleCvUpdated(payload: any) {
    console.log('CV UPDATED');
    console.log(payload);
  }

  @OnEvent(APP_EVENTS.CV_DELETE)
  async handleCvDeleted(payload: any) {
    console.log('CV DELETED');
    console.log(payload);
  }
    /*@OnEvent('cv.*')
    async handleCvEvents(payload: any) {
        console.log('Generic CV Event');
        console.log(payload);
    }*/
}