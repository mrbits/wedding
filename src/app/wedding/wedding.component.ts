import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-wedding',
  templateUrl: './wedding.component.html',
  styleUrls: ['./wedding.component.css']
})
export class WeddingComponent implements OnInit {

  constructor(private titleService: Title ) { }

  ngOnInit() {
    this.titleService.setTitle('Amanda & Luke\'s Wedding');
  }
}