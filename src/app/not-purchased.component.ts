import { Component } from "@angular/core";

@Component({
  template: `<div class="cover-container d-flex w-100 vh-100 p-3 mx-auto flex-column text-center">
  <header class="masthead mb-auto">
    <div class="inner">
      <h3 class="masthead-brand font-weight-bold">JTECH</h3>
    </div>
  </header>
  <main role="main" class="inner cover">
    <h2 class="cover-heading display-5 font-weight-bold">NOT PURCHASED</h2>
    <p class="lead">Unlock this module to enjoy more features.</p>
    <!-- <p class="lead">
    <a href="#" class="btn btn-lg btn-primary" [routerLink]="['/dashboard']"><small>GO TO DASHOBARD</small></a>
    </p> -->
  </main>
  <footer class="mastfoot mt-auto">
    <div class="inner">
    <p>Host Concepts © Jtech an HME Company.</p>
    </div>
  </footer>
</div>`
})
export class ModuleNotEnabledComponent {}
