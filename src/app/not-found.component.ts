import { Component } from "@angular/core";

@Component({
  template: `<div class="cover-container d-flex w-100 vh-100 p-3 mx-auto flex-column text-center">
  <header class="masthead mb-auto">
    <div class="inner">
      <h3 class="masthead-brand font-weight-bold">JTECH</h3>
    </div>
  </header>
  <main role="main" class="inner cover">
    <h2 class="cover-heading display-4 font-weight-bold">PAGE NOT FOUND</h2>
    <p class="lead">The page you are looking for is not found</p>
    <p class="lead">
    <a href="#" class="btn btn-lg btn-success" [routerLink]="['/dashboard']"><small>GO TO DASHOBARD</small></a>
    <a href="#" class="btn btn-lg btn-primary" [routerLink]="['/login']"><small>OR LOGIN</small></a>
    
    </p>
  </main>
  <footer class="mastfoot mt-auto">
    <div class="inner">
    <p>Host Concepts © Jtech an HME Company.</p>
    </div>
  </footer>
</div>`
})
export class PageNotFoundComponent {}
