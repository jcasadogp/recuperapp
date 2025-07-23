import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && typeof activeElement.blur === 'function') {
          activeElement.blur();
        }
      }
    });

    // Set keyboard resize mode when app starts
    this.initKeyboard();
  }

  private async initKeyboard() {
    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    } catch (error) {
      console.log('Keyboard plugin not available:', error);
    }
  }
}