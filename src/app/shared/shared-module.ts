import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const MODULES = [FormsModule, ReactiveFormsModule];

@NgModule({
  imports: MODULES,
  exports: MODULES,
})
export class SharedModule {}
