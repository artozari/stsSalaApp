import { Component } from '@angular/core';

@Component({
  selector: 'app-switchdarktheme',
  standalone: true,
  imports: [],
  templateUrl: './switchdarktheme.html',
  styleUrl: './switchdarktheme.css',
})
export class Switchdarktheme {
  toggleTheme() {
    const containerApp = document.getElementsByClassName('app-container')[0];
    if (containerApp.classList.contains('dark-theme')) {
      console.log('Cambiando a tema claro');
      containerApp.classList.remove('dark-theme');
      containerApp.classList.add('light-theme');
    } else {
      console.log('Cambiando a tema oscuro');
      containerApp.classList.remove('light-theme');
      containerApp.classList.add('dark-theme');
    }
  }
}
