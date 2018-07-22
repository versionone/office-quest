import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Hackweek Quest';
  constructor(private http:HttpClient) {

  }

  testApi() {
    this.http.get("http://localhost:4201/").subscribe(response => {
      if (Array.isArray(response)) {
        console.log("is array");
        response.forEach((result) => {
          console.log(result)
        })
      } else {
        console.log("not array", response)
      }
    }, error => {
      console.log("error", error)
    })
  }
}
