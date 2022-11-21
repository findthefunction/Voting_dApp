import { ElementSchemaRegistry } from '@angular/compiler';
import { Component } from '@angular/core';
import { ethers } from 'ethers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-app';

  counter =  0;

  someText = 'Some text here';

  lastBlockNumber: number | undefined;

  constructor() {
    ethers.providers.getDefaultProvider('goerli').getBlock('latest').then((block) => {
      this.lastBlockNumber = block.number
    })
  }

  clickMe() {
    this.counter++;
  }
}
