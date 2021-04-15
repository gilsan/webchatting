// Thanks to Jeff from angularfirebase.com
import {
  Directive, EventEmitter, Output,
  HostListener, ElementRef
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[scrollable]'
})
export class ScrollableDirective {

  @Output() scrollPosition = new EventEmitter();

  constructor(
    public el: ElementRef,
  ) { }

  @HostListener('scroll', ['$event'])
  onScroll(event): void {
    try {
      const top = event.target.scrollTop;
      const height = this.el.nativeElement.scrollHeight;
      const offset = this.el.nativeElement.offsetHeight;

      // emit button event
      if (top > height - offset - 1) {
        this.scrollPosition.emit('bottom');
      }
      // emit top event
      if (top === 0) {
        this.scrollPosition.emit('top');
      }



    } catch (err) { }
  }



}
